import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";

import Container from "../ui/Container";
import Logo from "./Logo";
import NotificationBell from "./NotificationBell";
import { useAuth } from "../../hooks/useAuth";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLanding = location.pathname === "/";
  const transparent = isLanding && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error(error);
    }
  };

  const guestNavigation = [
    { label: "Browse Turfs", to: "/turfs" },
    { label: "For Owners", to: "/register" },
  ];

  const playerNavigation = [
    { label: "Browse Turfs", to: "/turfs" },
    { label: "My Bookings", to: "/bookings" },
  ];

  const ownerNavigation = [
    { label: "Dashboard", to: "/owner/dashboard" },
    { label: "Calendar", to: "/owner/calendar" },
    { label: "My Turfs", to: "/owner/turfs" },
    { label: "Bookings", to: "/owner/bookings" },
  ];

  const navigation = !isAuthenticated
    ? guestNavigation
    : user?.role === "OWNER"
    ? ownerNavigation
    : playerNavigation;

  const navLinkClass = ({ isActive }) =>
    [
      "text-sm font-medium transition-colors duration-150",
      isActive
        ? "text-green-400"
        : "text-white/60 hover:text-white",
    ].join(" ");

  return (
    <header
      className={[
        "sticky top-0 z-50 transition-colors duration-300",
        transparent ? "bg-transparent" : "bg-[#090E09]",
      ].join(" ")}
    >
      <Container>
        <div className="flex h-[68px] items-center justify-between">

          <Logo />

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {navigation.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop right */}
          <div className="hidden items-center gap-5 md:flex">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="text-sm font-medium text-white/60 transition hover:text-white"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="rounded-xl bg-green-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-400 active:scale-95"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                <NotificationBell />
                <Link
                  to={user.role === "PLAYER" ? "/profile" : "/owner/profile"}
                  className="flex items-center gap-3 transition-opacity hover:opacity-75"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="h-8 w-8 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-sm font-bold text-white">
                      {user.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs uppercase tracking-wide text-white/40">
                      {user.role}
                    </p>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-medium text-white/50 transition hover:text-white"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="rounded-lg p-2 text-white/70 transition hover:text-white md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-white/10 py-6 md:hidden">
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

              <div className="border-t border-white/10 pt-5">
                {!isAuthenticated ? (
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}
                      className="text-sm font-medium text-white/60 transition hover:text-white text-left"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => { navigate("/register"); setMobileMenuOpen(false); }}
                      className="rounded-xl bg-green-500 px-5 py-2.5 text-sm font-semibold text-white text-center transition hover:bg-green-400"
                    >
                      Register
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{user.name}</p>
                      <p className="text-xs uppercase tracking-wide text-white/40">
                        {user.role}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white"
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}

export default Navbar;
