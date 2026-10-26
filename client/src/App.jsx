
import { Navigate, Route, Routes } from "react-router-dom";

// ==========================================
// PUBLIC PAGES
// ==========================================
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";

// ==========================================
// AGENT PAGES
// ==========================================
import AgentDashboard from "./pages/AgentDashboard";
import AgentProfile from "./pages/AgentProfile";
import ScenarioLibrary from "./pages/scenarioLibrary";
import ScenarioDetails from "./pages/ScenarioDetails";
import TrainingSession from "./pages/TrainingSession";
import FeedbackAnalysisPage from "./pages/FeedbackAnalysisPage";

// ==========================================
// MANAGER PAGES
// ==========================================
import ManagerDashboard from "./pages/ManagerDashboard";
import ManagerProfile from "./pages/ManagerProfile";
import ManagerLogin from "./pages/ManagerLogin";
import ManagerActivation from "./pages/ManagerActivation";

// ==========================================
// ADMIN PAGES
// ==========================================
import AdminDashboard from "./pages/AdminDashboard";

// ==========================================
// ROUTE PROTECTION
// ==========================================
import ProtectedRoute from "./components/ProtectedRoute";
import ManagerRoute from "./components/ManagerRoute";
import AdminRoute from "./components/AdminRoute";

// ==========================================
// STYLES
// ==========================================
import "./App.css";

function App() {
  return (
    <Routes>
      {/* =====================================
          PUBLIC ROUTES
      ===================================== */}

      <Route
        path="/"
        element={<LandingPage />}
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPasswordPage />}
      />

      {/* Google OAuth callback */}
      <Route
        path="/auth/callback"
        element={<OAuthCallbackPage />}
      />

      {/* =====================================
          MANAGER INVITATION ACTIVATION
          Public route: no login required
      ===================================== */}

      <Route
        path="/manager/activate"
        element={<ManagerActivation />}
      />

      {/* =====================================
          AGENT ROUTES
      ===================================== */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AgentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AgentProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/scenarios"
        element={
          <ProtectedRoute>
            <ScenarioLibrary />
          </ProtectedRoute>
        }
      />

      <Route
        path="/scenarios/:id"
        element={
          <ProtectedRoute>
            <ScenarioDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/training/:sessionId"
        element={
          <ProtectedRoute>
            <TrainingSession />
          </ProtectedRoute>
        }
      />

      <Route
        path="/session-feedback"
        element={<FeedbackAnalysisPage />}
      />

      {/* =====================================
          MANAGER ROUTES
      ===================================== */}

      <Route
        path="/manager/login"
        element={<ManagerLogin />}
      />

      <Route
        path="/manager/dashboard"
        element={
          <ManagerRoute>
            <ManagerDashboard />
          </ManagerRoute>
        }
      />

      <Route
        path="/manager/profile"
        element={
          <ManagerRoute>
            <ManagerProfile />
          </ManagerRoute>
        }
      />

      {/* =====================================
          ADMIN ROUTES
      ===================================== */}

      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* =====================================
          FALLBACK ROUTE
      ===================================== */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default App;
