import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import PlayerLayout from "./components/layout/PlayerLayout";
import OwnerLayout from "./components/layout/OwnerLayout";
import AuthLayout from "./components/layout/AuthLayout";

import LoginPage from "./pages/LoginPage";

import TurfListPage from "./pages/TurfListPage";
import TurfDetailsPage from "./pages/TurfDetailsPage";
import MyBookingsPage from "./pages/MyBookingsPage";

import OwnerDashboardPage from "./pages/OwnerDashboardPage";
import CreateTurfPage from "./pages/CreateTurfPage";
import MyTurfsPage from "./pages/MyTurfsPage";
import CreateSlotPage from "./pages/CreateSlotPage";
import EditTurfPage from "./pages/EditTurfPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Player */}
        <Route element={<PlayerLayout />}>
          <Route path="/" element={<TurfListPage />} />

          <Route path="/turfs/:id" element={<TurfDetailsPage />} />

          <Route
            path="/bookings"
            element={
              <ProtectedRoute allowedRole="PLAYER">
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Owner */}
        <Route element={<OwnerLayout />}>
          <Route
            path="/owner"
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
            path="/owner/turfs/:turfId/slots/create"
            element={
              <ProtectedRoute allowedRole="OWNER">
                <CreateSlotPage />
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
