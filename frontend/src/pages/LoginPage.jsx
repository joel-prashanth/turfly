import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { login } from "../api/authApi";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoggingIn(true);

    try {
      const response = await login(email, password);

      const user = response.data.user;

      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "OWNER") {
        toast.success(`🏟️ Welcome back, ${user.name}!`);

        navigate("/owner");
      } else {
        toast.success(`⚽ Welcome back, ${user.name}!`);

        navigate("/");
      }
    } catch (error) {
      console.error(error);

      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Welcome Back</h1>

        <p className="mb-8 text-slate-500">Login to continue to Turfly.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" className="w-full" disabled={isLoggingIn}>
            {isLoggingIn ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}
