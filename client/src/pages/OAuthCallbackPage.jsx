
import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function OAuthCallbackPage() {
  const navigate = useNavigate();

  const { completeOAuthLogin } = useAuth();

  

  const [message, setMessage] = useState(
    "Completing your sign-in..."
  );

  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;

    started.current = true;

    const finishOAuthLogin = async () => {
      try {
        // Exchange the one-time OAuth ticket for a JWT
        const response = await api.post(
  "/oauth/exchange"
        );

        // Save JWT and authenticated user
        completeOAuthLogin(response.data);

        // Get the authenticated user's role
        const role = response.data?.user?.role;

        // Redirect based on role
        switch (role) {
          case "manager":
            navigate("/manager/dashboard", {
              replace: true,
            });
            break;

          case "agent":
            navigate("/dashboard", {
              replace: true,
            });
            break;

          default:
            navigate("/", {
              replace: true,
            });
        }
      } catch (error) {
        console.error(
          "OAuth authentication failed:",
          error
        );

        setMessage(
          "Authentication failed. Redirecting..."
        );

        navigate(
          "/login?oauth_error=authentication_failed",
          { replace: true }
        );
      }
    };

    finishOAuthLogin();
  }, [completeOAuthLogin, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>PitchPilot AI</h2>

        <p>{message}</p>
      </div>
    </div>
  );
}
