import { useState } from "react";
import { Link, useNavigate,  useSearchParams, } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";
import SocialLogin from "../components/SocialLogin";


function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
 
const [searchParams] = useSearchParams();

const oauthError = searchParams.get("oauth_error");

const oauthMessages = {
  invalid_state: "Google sign-in expired. Please try again.",
  unverified_identity:
    "Google could not verify your email address.",
  missing_email:
    "Google did not provide an email address.",
  existing_account:
    "An account already uses this email. Sign in with your existing method.",
  inactive_account:
    "This account is inactive.",
  authentication_failed:
    "Google sign-in could not be completed. Please try again.",
};

const displayedError =
  error || (oauthError ? oauthMessages[oauthError] : "");


  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const result = await login(email, password);

switch (result.user.role) {
  case "manager":
    navigate("/manager/dashboard", { replace: true });
    break;

  case "agent":
    navigate("/dashboard", { replace: true });
    break;

  default:
    navigate("/", { replace: true });
}
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to sign in."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="brand">
          PitchPilot AI
        </Link>

        <h1>Welcome back</h1>

        <p className="auth-subtitle">
          Sign in to continue your sales training.
        </p>

        {displayedError && (
  <div className="error-message">
    {displayedError}
  </div>
)}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            
<PasswordInput
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  placeholder="Enter your password"
  autoComplete="current-password"
  required={true}
/>

          </div>

          <button
            className="auth-button"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <SocialLogin />

                <p className="auth-footer">
          New to PitchPilot?{" "}
          <Link to="/register">
            Create an account
          </Link>
        </p>
         <p className="auth-footer">
  Are you a sales manager?{" "}
  <Link to="/manager/login">
    Manager Login
  </Link>
</p>
      </div>

      {/* Login landscape image */}
      <div className="auth-image-panel auth-login-image">
        <div className="auth-image-overlay">
          <span>WELCOME BACK</span>
          <h2>Every great conversation starts somewhere.</h2>
          <p>Practice with purpose. Grow with confidence.</p>
        </div>
      </div>
    </div>
      
  );
}

export default LoginPage;