import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";

import AuthLayout from "./components/layout/AuthLayout";
import PlayerLayout from "./components/layout/PlayerLayout";
import OwnerLayout from "./components/layout/OwnerLayout";

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= Authentication ================= */}
        <Route element={<AuthLayout />}>
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
            path="/"
            element={
              <ProtectedRoute allowedRole="PLAYER">
                <TurfListPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/turfs/:id"
            element={
              <ProtectedRoute allowedRole="PLAYER">
                <TurfDetailsPage />
              </ProtectedRoute>
            }
          />

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
            path="/owner/turfs/:turfId/slots/create"
            element={
              <ProtectedRoute allowedRole="OWNER">
                <CreateSlotPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
