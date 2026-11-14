
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ManagerRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Checking manager access...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "manager") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
