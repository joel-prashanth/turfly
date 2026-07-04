import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const validate = (email, password) => {
  const errors = {};
  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!password) {
    errors.password = "Password is required.";
  }
  return errors;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const touch = (field) => {
    setTouched((p) => ({ ...p, [field]: true }));
    const e = validate(email, password);
    setErrors(e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    const e2 = validate(email, password);
    setErrors(e2);
    if (Object.keys(e2).length) return;

    try {
      setIsLoggingIn(true);
      const user = await login(email, password);
      if (user.role === "OWNER") {
        toast.success(`Welcome back, ${user.name}!`);
        navigate("/owner/dashboard", { replace: true });
      } else if (user.role === "ADMIN") {
        toast.success(`Welcome back, ${user.name}!`);
        navigate("/admin/dashboard", { replace: true });
      } else {
        toast.success(`Welcome back, ${user.name}!`);
        navigate("/turfs", { replace: true });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Login failed.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const eyeButton = (show, toggle) => (
    <button
      type="button"
      onClick={toggle}
      className="flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
      tabIndex={-1}
      aria-label={show ? "Hide password" : "Show password"}
    >
      {show ? <EyeOff size={17} /> : <Eye size={17} />}
    </button>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Welcome Back</h1>
        <p className="mb-8 text-slate-500">Login to continue to Turfly.</p>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (touched.email) setErrors(validate(e.target.value, password));
            }}
            onBlur={() => touch("email")}
            error={touched.email ? errors.email : undefined}
          />

          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (touched.password) setErrors(validate(email, e.target.value));
            }}
            onBlur={() => touch("password")}
            error={touched.password ? errors.password : undefined}
            rightElement={eyeButton(showPassword, () => setShowPassword((v) => !v))}
          />

          <Button type="submit" className="w-full" loading={isLoggingIn}>
            Login
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-green-600 hover:text-green-700">
            Create one
          </Link>
        </p>

        <div className="mt-4 flex items-center justify-center gap-3 text-xs text-slate-300">
          <span>Admin?</span>
          <span className="text-slate-200">·</span>
          <span className="text-slate-400">Sign in above</span>
          <span className="text-slate-200">·</span>
          <Link to="/admin/setup" className="hover:text-slate-400 transition underline underline-offset-2">
            First time setup
          </Link>
        </div>
      </div>
    </div>
  );
}
