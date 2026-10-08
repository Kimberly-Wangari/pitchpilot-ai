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

import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

function App() {
  return (
    <Routes>
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
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AgentDashboard />
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
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default App;