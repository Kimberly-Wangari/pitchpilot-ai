
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AUTHORIZED_ADMIN_EMAIL =
  "pitchpilot.admin@gmail.com";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  // Wait for authentication to finish.
  if (loading) {
    return <p>Checking administrator access...</p>;
  }

  // Redirect unauthenticated users.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Only the designated admin account can
  // access the administrator dashboard.
  const isAuthorizedAdmin =
    user.role === "admin" &&
    user.email?.trim().toLowerCase() ===
      AUTHORIZED_ADMIN_EMAIL;

  if (!isAuthorizedAdmin) {
    const destination =
      user.role === "manager"
        ? "/manager/dashboard"
        : "/dashboard";

    return <Navigate to={destination} replace />;
  }

  return children;
}
