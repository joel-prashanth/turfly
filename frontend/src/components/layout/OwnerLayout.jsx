import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function OwnerLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <Outlet />
    </div>
  );
}

export default OwnerLayout;
