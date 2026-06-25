import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Building2, CheckCircle2, FileText, Upload, User, X } from "lucide-react";
import toast from "react-hot-toast";

import { register, updateSettings } from "../api/authApi";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const DOC_TYPES = [
  { value: "GST_CERTIFICATE",   label: "GST Certificate" },
  { value: "SHOP_REGISTRATION", label: "Shop & Establishment Registration" },
  { value: "VENUE_PHOTO_ID",    label: "Venue Photo ID / Lease Agreement" },
  { value: "OTHER",             label: "Other official document" },
];

const CLOUDINARY_UPLOAD_PRESET = "turfly_uploads";
const CLOUDINARY_CLOUD_NAME    = "dxctszlqo";

async function uploadToCloudinary(file) {
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  form.append("folder", "turfly/verification");
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
    { method: "POST", body: form },
  );
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

// ── Validation ────────────────────────────────────────────────────────────────

const validateField = (name, value, formData) => {
  switch (name) {
    case "name":
      if (!value.trim()) return "Full name is required.";
      if (value.trim().length < 2) return "Name must be at least 2 characters.";
      return "";
    case "email":
      if (!value.trim()) return "Email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address.";
      return "";
    case "phone":
      if (!value.trim()) return "Phone number is required.";
      if (!/^[6-9]\d{9}$/.test(value)) return "Enter a valid 10-digit mobile number starting with 6–9.";
      return "";
    case "password":
      if (!value) return "Password is required.";
      if (value.length < 8) return "Password must be at least 8 characters.";
      return "";
    case "confirmPassword":
      if (!value) return "Please confirm your password.";
      if (value !== formData.password) return "Passwords do not match.";
      return "";
    default:
      return "";
  }
};

const validateAll = (formData) => {
  const fields = ["name", "email", "phone", "password", "confirmPassword"];
  const errors = {};
  fields.forEach((f) => {
    const msg = validateField(f, formData[f], formData);
    if (msg) errors[f] = msg;
  });
  return errors;
};

// ── Password strength ─────────────────────────────────────────────────────────

const getStrength = (pw) => {
  if (!pw) return null;
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: "Weak",   color: "bg-red-400",    width: "w-1/4" };
  if (score <= 2) return { label: "Fair",   color: "bg-amber-400",  width: "w-2/4" };
  if (score <= 3) return { label: "Good",   color: "bg-blue-400",   width: "w-3/4" };
  return              { label: "Strong", color: "bg-emerald-500", width: "w-full" };
};

// ── Eye button helper ─────────────────────────────────────────────────────────

function EyeToggle({ show, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      tabIndex={-1}
      aria-label={show ? "Hide password" : "Show password"}
      className="flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
    >
      {show ? <EyeOff size={17} /> : <Eye size={17} />}
    </button>
  );
}

// ── Step 1: Registration form ─────────────────────────────────────────────────

function RegisterForm({ onOwnerRegistered, onPlayerRegistered, setUser }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: "", role: "PLAYER",
  });
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = name === "phone"
      ? { ...formData, phone: value.replace(/\D/g, "").slice(0, 10) }
      : { ...formData, [name]: value };
    setFormData(next);
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, next[name], next) }));
    }
    // Re-validate confirmPassword live when password changes
    if (name === "password" && touched.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: validateField("confirmPassword", next.confirmPassword, next) }));
    }
  };

  const handleBlur = (name) => {
    setTouched((p) => ({ ...p, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, formData[name], formData) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = { name: true, email: true, phone: true, password: true, confirmPassword: true };
    setTouched(allTouched);
    const errs = validateAll(formData);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      setLoading(true);
      const res = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      });
      if (formData.role === "OWNER") {
        onOwnerRegistered(res.data.user);
      } else {
        setUser(res.data.user);
        toast.success("Account created! Welcome to Turfly.");
        onPlayerRegistered();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(formData.password);

  return (
    <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl">
      <h1 className="mb-2 text-3xl font-bold text-slate-900">Create Account</h1>
      <p className="mb-8 text-slate-500">Join Turfly and start playing or managing turfs.</p>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Input
          label="Full Name"
          name="name"
          placeholder="John Doe"
          value={formData.name}
          onChange={handleChange}
          onBlur={() => handleBlur("name")}
          error={touched.name ? errors.name : undefined}
        />

        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={() => handleBlur("email")}
          error={touched.email ? errors.email : undefined}
        />

        <Input
          label="Phone Number"
          type="tel"
          name="phone"
          placeholder="9876543210"
          inputMode="numeric"
          maxLength={10}
          autoComplete="tel"
          value={formData.phone}
          onChange={handleChange}
          onBlur={() => handleBlur("phone")}
          error={touched.phone ? errors.phone : undefined}
          helperText={!touched.phone || !errors.phone ? "10-digit mobile number" : undefined}
        />

        <div className="space-y-1.5">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            onBlur={() => handleBlur("password")}
            error={touched.password ? errors.password : undefined}
            rightElement={<EyeToggle show={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
          />
          {/* Strength bar — only show when typing */}
          {formData.password && strength && (
            <div className="space-y-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
              </div>
              <p className={`text-xs font-medium ${
                strength.label === "Weak" ? "text-red-500" :
                strength.label === "Fair" ? "text-amber-500" :
                strength.label === "Good" ? "text-blue-500" : "text-emerald-600"
              }`}>{strength.label} password</p>
            </div>
          )}
        </div>

        <Input
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={() => handleBlur("confirmPassword")}
          error={touched.confirmPassword ? errors.confirmPassword : undefined}
          rightElement={<EyeToggle show={showConfirmPassword} onToggle={() => setShowConfirmPassword((v) => !v)} />}
        />

        <div>
          <label className="mb-3 block text-sm font-medium text-slate-700">Register As</label>
          <div className="grid grid-cols-2 gap-4">
            {[
              { role: "PLAYER", Icon: User,      title: "Player",     desc: "Book and play at nearby turfs." },
              { role: "OWNER",  Icon: Building2, title: "Turf Owner", desc: "Manage your sports venues." },
            ].map(({ role, Icon, title, desc }) => (
              <button
                key={role}
                type="button"
                onClick={() => setFormData((p) => ({ ...p, role }))}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  formData.role === role
                    ? "border-green-600 bg-green-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <Icon className="mb-3 text-green-600" />
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-slate-500">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" loading={loading} className="w-full">
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-green-600 hover:text-green-700">
          Sign In
        </Link>
      </p>
    </div>
  );
}

// ── Step 2: Verification upload (owner only) ──────────────────────────────────

function VerificationStep({ user, onDone }) {
  const [docType, setDocType]   = useState("");
  const [file, setFile]         = useState(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone]         = useState(false);
  const inputRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { toast.error("File must be under 10 MB."); return; }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!docType) { toast.error("Select a document type first."); return; }
    if (!file) { toast.error("Choose a file to upload."); return; }
    setUploading(true);
    try {
      const result = await uploadToCloudinary(file);
      await updateSettings({
        verificationDocUrl: result.secure_url,
        verificationDocPublicId: result.public_id,
        verificationDocType: docType,
      });
      setDone(true);
    } catch {
      toast.error("Upload failed. You can try again from Settings.");
    } finally {
      setUploading(false);
    }
  };

  if (done) {
    return (
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">You're all set!</h2>
        <p className="mt-2 text-slate-500">
          Document uploaded. Our team will review your venue and approve it shortly.
        </p>
        <Button className="mt-8 w-full" onClick={onDone}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Account created!</h2>
          <p className="text-sm text-slate-500">
            One last step — upload a document so we can verify your venue faster.
          </p>
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-slate-700">Document type</label>
        <div className="space-y-2">
          {DOC_TYPES.map((d) => (
            <label
              key={d.value}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                docType === d.value ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="docType"
                value={d.value}
                checked={docType === d.value}
                onChange={() => setDocType(d.value)}
                className="accent-emerald-500"
              />
              <span className="text-sm font-medium text-slate-700">{d.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className={`mb-5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 transition-colors ${
          file ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:border-emerald-300"
        }`}
      >
        <input ref={inputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFile} />
        {file ? (
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">{file.name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="ml-1 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="h-6 w-6 text-slate-400" />
            <p className="text-sm text-slate-500">Click to upload — image or PDF, max 10 MB</p>
          </>
        )}
      </div>

      <Button
        onClick={handleUpload}
        loading={uploading}
        disabled={!docType || !file}
        className="w-full mb-3"
      >
        Upload & Submit for Review
      </Button>

      <button
        onClick={onDone}
        disabled={uploading}
        className="w-full py-2.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        Skip for now — I'll upload from Settings
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function RegisterPage() {
  const navigate  = useNavigate();
  const { setUser } = useAuth();
  const [step, setStep]         = useState("form");
  const [ownerUser, setOwnerUser] = useState(null);

  const handleOwnerRegistered  = (user) => { setOwnerUser(user); setStep("verify"); };
  const handlePlayerRegistered = () => navigate("/login");
  const handleVerificationDone = () => setUser(ownerUser);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      {step === "form" ? (
        <RegisterForm
          onOwnerRegistered={handleOwnerRegistered}
          onPlayerRegistered={handlePlayerRegistered}
          setUser={setUser}
        />
      ) : (
        <VerificationStep user={ownerUser} onDone={handleVerificationDone} />
      )}
    </div>
  );
}

export default RegisterPage;
