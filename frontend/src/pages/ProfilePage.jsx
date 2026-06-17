import { Camera, Mail, Phone, ShieldCheck, User } from "lucide-react";

import { useAuth } from "../hooks/useAuth";

import Container from "../components/ui/Container";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

function getInitials(name = "") {
  const words = name.trim().split(" ").filter(Boolean);

  if (words.length === 0) return "U";

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function ProfilePage() {
  const { user } = useAuth();

  const initials = getInitials(user?.name);

  return (
    <Container className="py-8">
      <PageHeader
        title="Profile"
        subtitle="Manage your personal information and account preferences."
      />

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <Card className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-green-100 text-2xl font-bold text-green-700">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user?.name || "Profile"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              <button
                type="button"
                className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-green-50 hover:text-green-700"
                title="Profile image upload coming soon"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              {user?.name || "User"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {user?.email || "No email available"}
            </p>

            <span className="mt-4 rounded-full bg-green-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-green-700">
              {user?.role || "USER"}
            </span>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-50 text-green-700">
                <User className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Personal Information
                </h2>
                <p className="text-sm text-slate-500">
                  Your basic account details.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Full Name
                </label>

                <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900">
                  {user?.name || "Not available"}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  Email Address
                </label>

                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {user?.email || "Not available"}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  Phone Number
                </label>

                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500">
                  <Phone className="h-4 w-4 text-slate-400" />
                  Coming soon
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  Account Role
                </label>

                <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium uppercase tracking-wide text-slate-900">
                  {user?.role || "USER"}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button disabled>Edit Profile Soon</Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-50 text-green-700">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-950">Security</h2>
                <p className="text-sm text-slate-500">
                  Manage your password and account security.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <h3 className="font-semibold text-slate-900">
                Password management
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Change password functionality will be added in the next step.
              </p>

              <div className="mt-4">
                <Button disabled>Change Password Soon</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Container>
  );
}

export default ProfilePage;
