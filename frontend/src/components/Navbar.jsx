import { Link, useNavigate } from "react-router-dom";
import { logout } from "../api/authApi";

function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

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
    <nav className="flex justify-between items-center p-4 border-b">
      <Link to="/" className="text-xl font-bold">
        Turfly
      </Link>

      <Link to="/">Turfs</Link>

      <div className="flex gap-4">
        {user?.role === "OWNER" && <Link to="/owner">Owner Dashboard</Link>}

        {user?.role === "PLAYER" && <Link to="/bookings">My Bookings</Link>}

        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
