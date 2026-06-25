import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, KeyRound, Lock, Mail, Phone, ShieldCheck, User } from "lucide-react";
import toast from "react-hot-toast";
import { setupAdmin } from "../../api/adminApi";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

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
        className="absolute right-3 top-9 text-slate-400 transition hover:text-slate-300"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function AdminSetupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    setupKey: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    try {
      setLoading(true);
      await setupAdmin(form);
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Setup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">Admin Setup</h1>
          <p className="mt-1.5 text-sm text-slate-400">
            One-time setup to create the platform admin account.
          </p>
        </div>

        {done ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-8 text-center">
            <ShieldCheck className="mx-auto h-10 w-10 text-emerald-400" />
            <h2 className="mt-4 text-lg font-bold text-white">Admin account created</h2>
            <p className="mt-2 text-sm text-slate-400">
              This setup page is now permanently locked. Log in with your credentials.
            </p>
            <Button className="mt-6 w-full" onClick={() => navigate("/login")}>
              Go to Login
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6"
          >
            <Input
              label="Full Name"
              name="name"
              value={form.name}
              onChange={set("name")}
              leftIcon={User}
              placeholder="Your name"
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={set("email")}
              leftIcon={Mail}
              placeholder="admin@example.com"
              required
            />
            <Input
              label="Phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={set("phone")}
              leftIcon={Phone}
              placeholder="10-digit mobile number"
              required
            />
            <PasswordInput
              label="Password"
              name="password"
              value={form.password}
              onChange={set("password")}
              placeholder="Min. 8 characters"
            />

            <div className="border-t border-slate-800 pt-4">
              <PasswordInput
                label="Setup Key"
                name="setupKey"
                value={form.setupKey}
                onChange={set("setupKey")}
                placeholder="Secret key from your .env file"
              />
              <p className="mt-2 text-xs text-slate-500">
                This must match <code className="rounded bg-slate-800 px-1 py-0.5 text-slate-300">ADMIN_SETUP_SECRET</code> in your backend <code className="rounded bg-slate-800 px-1 py-0.5 text-slate-300">.env</code>.
              </p>
            </div>

            <Button type="submit" loading={loading} className="w-full">
              <KeyRound className="h-4 w-4" />
              Create Admin Account
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
