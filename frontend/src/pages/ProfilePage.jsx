import { useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../hooks/useAuth";
import { updateProfile, changePassword } from "../api/authApi";
import { uploadImage } from "../services/upload.service";

import Container from "../components/ui/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

function getInitials(name = "") {
  const words = name.trim().split(" ").filter(Boolean);
  if (words.length === 0) return "U";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function PasswordInput({ label, name, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        label={label}
        name={name}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        leftIcon={Lock}
        required
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-9 text-slate-400 transition hover:text-slate-600"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function ProfilePage() {
  const { user, setUser } = useAuth();
  const avatarInputRef = useRef(null);

  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  // Avatar upload state
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Password state
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState("");

  const initials = getInitials(user?.name);

  // ── Avatar upload ──────────────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Only JPG, PNG or WEBP images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }

    try {
      setAvatarUploading(true);
      const uploaded = await uploadImage(file);
      const res = await updateProfile({
        avatarUrl: uploaded.image.url,
        avatarPublicId: uploaded.image.publicId,
      });
      setUser(res.data.user);
      toast.success("Profile picture updated.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload photo.");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  // ── Edit profile ───────────────────────────────────────────────
  const startEditing = () => {
    setProfileForm({ name: user?.name || "", phone: user?.phone || "" });
    setEditing(true);
  };

  const cancelEditing = () => setEditing(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
      });
      setUser(res.data.user);
      setEditing(false);
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Change password ────────────────────────────────────────────
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError("");

    if (pwForm.next !== pwForm.confirm) {
      setPwError("New passwords don't match.");
      return;
    }
    if (pwForm.next.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }

    try {
      setSavingPw(true);
      await changePassword(pwForm.current, pwForm.next);
      toast.success("Password updated.");
      setPwForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      setPwError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <Container className="py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-950">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your personal information and account security.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
        {/* ── Avatar card ── */}
        <Card className="flex flex-col items-center p-8 text-center">
          <div className="relative">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl bg-green-100 text-3xl font-bold text-green-700">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user?.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
              {avatarUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/50">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-green-50 hover:text-green-700 disabled:opacity-50"
            >
              <Camera className="h-4 w-4" />
            </button>

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <h2 className="mt-6 text-xl font-bold text-slate-950">
            {user?.name || "User"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
          <span className="mt-4 rounded-full bg-green-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-green-700">
            {user?.role}
          </span>

          <p className="mt-6 text-xs text-slate-400">
            Click the camera icon to update your photo
          </p>
        </Card>

        <div className="space-y-6">
          {/* ── Personal information ── */}
          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-50 text-green-700">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Personal Information
                  </h2>
                  <p className="text-sm text-slate-500">Your basic account details.</p>
                </div>
              </div>

              {!editing && (
                <button
                  type="button"
                  onClick={startEditing}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleProfileSave} className="space-y-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm((f) => ({ ...f, name: e.target.value }))
                  }
                  leftIcon={User}
                  required
                />
                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  leftIcon={Phone}
                  placeholder="10-digit mobile number"
                  required
                />

                <div className="flex gap-3 pt-2">
                  <Button type="submit" loading={savingProfile}>
                    <CheckCircle2 className="h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={cancelEditing}
                    disabled={savingProfile}
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { icon: User, label: "Full Name", value: user?.name },
                  { icon: Mail, label: "Email Address", value: user?.email },
                  { icon: Phone, label: "Phone Number", value: user?.phone },
                  {
                    icon: null,
                    label: "Account Role",
                    value: user?.role,
                    mono: true,
                  },
                ].map(({ icon: Icon, label, value, mono }) => (
                  <div key={label}>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <div className="mt-1.5 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      {Icon && <Icon className="h-4 w-4 shrink-0 text-slate-400" />}
                      <span
                        className={`text-sm font-medium text-slate-900 ${mono ? "uppercase tracking-wide" : ""}`}
                      >
                        {value || "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ── Change password ── */}
          <Card className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-50 text-green-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-950">Security</h2>
                <p className="text-sm text-slate-500">Change your account password.</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <PasswordInput
                label="Current Password"
                name="current"
                value={pwForm.current}
                onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
                placeholder="Enter your current password"
              />
              <PasswordInput
                label="New Password"
                name="next"
                value={pwForm.next}
                onChange={(e) => { setPwForm((f) => ({ ...f, next: e.target.value })); setPwError(""); }}
                placeholder="At least 6 characters"
              />
              <PasswordInput
                label="Confirm New Password"
                name="confirm"
                value={pwForm.confirm}
                onChange={(e) => { setPwForm((f) => ({ ...f, confirm: e.target.value })); setPwError(""); }}
                placeholder="Repeat new password"
              />

              {pwError && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
                  {pwError}
                </p>
              )}

              <Button type="submit" loading={savingPw}>
                Update Password
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </Container>
  );
}

export default ProfilePage;
