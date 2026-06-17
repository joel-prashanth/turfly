import { useState } from "react";
import { Outlet } from "react-router-dom";

import OwnerSidebar from "./OwnerSidebar";
import OwnerTopbar from "./OwnerTopbar";

function OwnerLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden shrink-0 lg:block">
        <OwnerSidebar />
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />

          <div className="relative z-10 h-full w-72 max-w-[85vw] bg-white shadow-2xl">
            <OwnerSidebar onNavigate={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <OwnerTopbar onMenuClick={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default OwnerLayout;
