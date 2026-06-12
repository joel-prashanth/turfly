import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import Button from "../ui/Button";
import Container from "../ui/Container";
import Logo from "./Logo";

import { logout } from "../../api/authApi";

function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = async () => {
    try {
      await logout();

      localStorage.removeItem("user");

      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-lg">
      <Container className="flex h-20 items-center justify-between">
        <Logo />

        <nav className="flex items-center gap-8 text-sm font-medium">
          <Link to="/" className="transition hover:text-green-600">
            Browse
          </Link>

          {user?.role === "PLAYER" && (
            <Link to="/bookings" className="transition hover:text-green-600">
              My Bookings
            </Link>
          )}

          {user?.role === "OWNER" && (
            <Link to="/owner" className="transition hover:text-green-600">
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden text-right md:block">
              <p className="font-semibold text-slate-900">{user.name}</p>

              <p className="text-sm text-slate-500">{user.role}</p>
            </div>
          )}

          <Button variant="ghost" onClick={handleLogout}>
            <LogOut size={18} className="mr-2" />
            Logout
          </Button>
        </div>
      </Container>
    </header>
  );
}

export default Navbar;
