import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import TurfListPage from "./pages/TurfListPage";
import TurfDetailsPage from "./pages/TurfDetailsPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import OwnerDashboardPage from "./pages/OwnerDashboardPage";
import CreateTurfPage from "./pages/CreateTurfPage";
import MyTurfsPage from "./pages/MyTurfsPage";
import CreateSlotPage from "./pages/CreateSlotPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";


function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

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
        <Route
          path="/owner"
          element={
            <ProtectedRoute allowedRole="OWNER">
              <OwnerDashboardPage />
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
          path="/owner/turfs"
          element={
            <ProtectedRoute allowedRole="OWNER">
              <MyTurfsPage />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
