import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";

import PublicLayout from "./components/layout/PublicLayout";
import PlayerLayout from "./components/layout/PlayerLayout";
import OwnerLayout from "./components/layout/OwnerLayout";

import LandingPage from "./pages/LandingPage";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import TurfListPage from "./pages/TurfListPage";
import TurfDetailsPage from "./pages/TurfDetailsPage";
import MyBookingsPage from "./pages/MyBookingsPage";

import OwnerDashboardPage from "./pages/OwnerDashboardPage";
import MyTurfsPage from "./pages/MyTurfsPage";
import CreateTurfPage from "./pages/CreateTurfPage";
import EditTurfPage from "./pages/EditTurfPage";
import CreateSlotPage from "./pages/CreateSlotPage";
import OwnerCalendarPage from "./pages/OwnerCalendarPage";
import OwnerBookingsPage from "./pages/OwnerBookingsPage";
import ManageSlotsPage from "./pages/ManageSlotsPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= Public ================= */}
        <Route element={<PublicLayout />}>
          <Route
            path="/"
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            }
          />

          <Route path="/turfs" element={<TurfListPage />} />

          <Route path="/turfs/:id" element={<TurfDetailsPage />} />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
        </Route>

        {/* ================= Player ================= */}
        <Route element={<PlayerLayout />}>
          <Route
            path="/bookings"
            element={
              <ProtectedRoute allowedRole="PLAYER">
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ================= Owner ================= */}
        <Route element={<OwnerLayout />}>
          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute allowedRole="OWNER">
                <OwnerDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/owner/profile"
            element={
              <ProtectedRoute allowedRole="OWNER">
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/owner/turfs"
            element={
              <ProtectedRoute allowedRole="OWNER">
                <MyTurfsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/owner/turfs/create"
            element={
              <ProtectedRoute allowedRole="OWNER">
                <CreateTurfPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/owner/turfs/:turfId/edit"
            element={
              <ProtectedRoute allowedRole="OWNER">
                <EditTurfPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/owner/turfs/:turfId/slots"
            element={
              <ProtectedRoute allowedRole="OWNER">
                <ManageSlotsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/owner/turfs/:turfId/slots/create"
            element={
              <ProtectedRoute allowedRole="OWNER">
                <CreateSlotPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/owner/calendar"
            element={
              <ProtectedRoute allowedRole="OWNER">
                <OwnerCalendarPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/owner/bookings"
            element={
              <ProtectedRoute allowedRole="OWNER">
                <OwnerBookingsPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
