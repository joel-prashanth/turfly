import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Clock, LogOut, ShieldX } from "lucide-react";

import OwnerSidebar from "./OwnerSidebar";
import OwnerTopbar from "./OwnerTopbar";
import { useAuth } from "../../hooks/useAuth";
import { logout as logoutApi } from "../../api/authApi";

function PendingScreen() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logoutApi();
    setUser(null);
    navigate("/login");
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
          <Clock className="h-8 w-8 text-amber-500" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-900">Account Under Review</h1>
        <p className="mt-3 text-sm text-slate-500 leading-relaxed">
          Your venue owner account is pending approval by the Turfly team. We'll verify your details and activate your account shortly — usually within 24 hours.
        </p>
        <p className="mt-4 text-xs text-slate-400">
          Questions? Reach us at <span className="font-medium text-slate-600">support@turfly.in</span>
        </p>
        <button
          onClick={handleLogout}
          className="mt-8 flex items-center gap-2 mx-auto text-sm text-slate-500 hover:text-slate-800 transition"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

function SuspendedScreen({ reason }) {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logoutApi();
    setUser(null);
    navigate("/login");
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
          <ShieldX className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-900">Account Suspended</h1>
        <p className="mt-3 text-sm text-slate-500 leading-relaxed">
          Your venue owner account has been suspended and is no longer visible to players.
        </p>
        {reason && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="font-semibold">Reason: </span>{reason}
          </div>
        )}
        <p className="mt-4 text-xs text-slate-400">
          To appeal, contact <span className="font-medium text-slate-600">support@turfly.in</span>
        </p>
        <button
          onClick={handleLogout}
          className="mt-8 flex items-center gap-2 mx-auto text-sm text-slate-500 hover:text-slate-800 transition"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

function OwnerLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user } = useAuth();

  if (user?.ownerStatus === "PENDING_REVIEW") return <PendingScreen />;
  if (user?.ownerStatus === "SUSPENDED") return <SuspendedScreen reason={user.ownerStatusReason} />;

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
