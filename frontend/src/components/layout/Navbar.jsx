import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";

import Button from "../ui/Button";
import Container from "../ui/Container";
import Logo from "./Logo";

import { useAuth } from "../../hooks/useAuth";

function Navbar() {
  const navigate = useNavigate();

  const { user, isAuthenticated, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const navLinkClass = ({ isActive }) =>
    [
      "transition-colors duration-200",
      isActive
        ? "font-semibold text-green-600"
        : "text-slate-700 hover:text-green-600",
    ].join(" ");

  const guestNavigation = [
    {
      label: "Browse Turfs",
      to: "/turfs",
    },
    {
      label: "For Owners",
      to: "/register",
    },
  ];

  const playerNavigation = [
    {
      label: "Browse Turfs",
      to: "/turfs",
    },
    {
      label: "My Bookings",
      to: "/bookings",
    },
  ];

  const ownerNavigation = [
    {
      label: "Dashboard",
      to: "/owner/dashboard",
    },
    {
      label: "Calendar",
      to: "/owner/calendar",
    },
    {
      label: "My Turfs",
      to: "/owner/turfs",
    },
    {
      label: "Bookings",
      to: "/owner/bookings",
    },
  ];

  const navigation = !isAuthenticated
    ? guestNavigation
    : user?.role === "OWNER"
      ? ownerNavigation
      : playerNavigation;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
      <Container>
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            {navigation.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Right */}
          <div className="hidden items-center gap-5 md:flex">
            {!isAuthenticated ? (
              <>
                <Button variant="ghost" onClick={() => navigate("/login")}>
                  Login
                </Button>

                <Button onClick={() => navigate("/register")}>Register</Button>
              </>
            ) : (
              <>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{user.name}</p>

                  <p className="text-sm uppercase tracking-wide text-slate-500">
                    {user.role}
                  </p>
                </div>

                <Button variant="ghost" onClick={handleLogout}>
                  <LogOut size={18} className="mr-2" />
                  Logout
                </Button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="rounded-lg p-2 transition hover:bg-slate-100 md:hidden"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 py-5 md:hidden">
            <div className="flex flex-col gap-5">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={navLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}

              {!isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate("/login");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Login
                  </Button>

                  <Button
                    onClick={() => {
                      navigate("/register");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Register
                  </Button>
                </>
              ) : (
                <>
                  <div className="border-t border-slate-200 pt-5">
                    <p className="font-semibold text-slate-900">{user.name}</p>

                    <p className="text-sm uppercase tracking-wide text-slate-500">
                      {user.role}
                    </p>
                  </div>

                  <Button variant="ghost" onClick={handleLogout}>
                    <LogOut size={18} className="mr-2" />
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}

export default Navbar;
