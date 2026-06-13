import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";

function BaseLayout({ className = "" }) {
  return (
    <div className={`min-h-screen ${className}`}>
      <Navbar />
      <Outlet />
    </div>
  );
}

export default BaseLayout;
