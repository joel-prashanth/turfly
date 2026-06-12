import { Navigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return (
      <Navigate to={user.role === "OWNER" ? "/owner/dashboard" : "/"} replace />
    );
  }

  return children;
}

export default PublicRoute;
