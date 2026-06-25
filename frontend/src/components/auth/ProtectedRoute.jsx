import { Navigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    const fallback =
      user.role === "OWNER"
        ? "/owner/dashboard"
        : user.role === "ADMIN"
          ? "/admin/dashboard"
          : "/turfs";
    return <Navigate to={fallback} replace />;
  }

  return children;
}

export default ProtectedRoute;
