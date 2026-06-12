import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { User, Building2 } from "lucide-react";

import { register } from "../api/authApi";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

function RegisterPage() {
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "PLAYER",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({
      ...prev,
      role,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setIsRegistering(true);

      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      toast.success("Account created successfully!");

      navigate("/login");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Registration failed."
      );
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">
          Create Account
        </h1>

        <p className="mb-8 text-slate-500">
          Join Turfly and start playing or managing turfs.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Full Name"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
          />

          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="john@example.com"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
          />

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Enter password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">
              Register As
            </label>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleRoleChange("PLAYER")}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  formData.role === "PLAYER"
                    ? "border-green-600 bg-green-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <User className="mb-3 text-green-600" />

                <h3 className="font-semibold">Player</h3>

                <p className="mt-1 text-sm text-slate-500">
                  Book and play at nearby turfs.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange("OWNER")}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  formData.role === "OWNER"
                    ? "border-green-600 bg-green-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <Building2 className="mb-3 text-green-600" />

                <h3 className="font-semibold">Turf Owner</h3>

                <p className="mt-1 text-sm text-slate-500">
                  Manage your sports venues.
                </p>
              </button>
            </div>
          </div>

          <Button
            type="submit"
            loading={isRegistering}
            className="w-full"
          >
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-green-600 hover:text-green-700"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;