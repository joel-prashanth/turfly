import { Navigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
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

export default PublicRoute;
