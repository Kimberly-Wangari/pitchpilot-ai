
import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AgentDashboard from "./pages/AgentDashboard";
import ScenarioLibrary from "./pages/scenarioLibrary";
import ScenarioDetails from "./pages/ScenarioDetails";
import TrainingSession from "./pages/TrainingSession";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import ManagerDashboard from "./pages/ManagerDashboard";
import ManagerRoute from "./components/ManagerRoute";



import ProtectedRoute from "./components/ProtectedRoute";
import ManagerLogin from "./pages/ManagerLogin";

import "./App.css";

function App() {
  return (
    <Routes>
      {/* Public routes */}
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

      {/* OAuth callback - must remain public */}
      <Route
        path="/auth/callback"
        element={<OAuthCallbackPage />}
      />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AgentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Scenario library */}
      <Route
        path="/scenarios"
        element={
          <ProtectedRoute>
            <ScenarioLibrary />
          </ProtectedRoute>
        }
      />

      {/* Scenario details */}
      <Route
        path="/scenarios/:id"
        element={
          <ProtectedRoute>
            <ScenarioDetails />
          </ProtectedRoute>
        }
      />
      

      {/* Training session */}
      <Route
        path="/training/:sessionId"
        element={
          <ProtectedRoute>
            <TrainingSession />
          </ProtectedRoute>
        }
      />
      <Route
  path="/manager/dashboard"
  element={
    <ManagerRoute>
      <ManagerDashboard />
    </ManagerRoute>
  }
/>

      {/* Fallback route */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
     
      <Route
  path="/manager/login"
  element={<ManagerLogin />}
/>
    </Routes>
    
  );
}

export default App;
