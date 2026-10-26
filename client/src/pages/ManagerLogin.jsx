
import { useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";
import SocialLogin from "../components/SocialLogin";
import OtpVerificationForm from "../components/OtpVerificationForm";

import "./ManagerLogin.css";

function ManagerLogin() {
  const navigate = useNavigate();
  const { login, verifyOtp, resendOtp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [challenge, setChallenge] = useState(null);

  const [searchParams] = useSearchParams();
  const oauthError = searchParams.get("oauth_error");

  const oauthMessages = {
    invalid_state:
      "Google sign-in expired. Please try again.",
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
      setChallenge(await login(email.trim(), password));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to sign in. Please check your credentials."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const finishLogin = (result) => {
    switch (result.user.role) {
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
  };

  const handleVerify = async (code) => {
    setError("");
    setSubmitting(true);
    try {
      finishLogin(await verifyOtp(challenge.challengeId, code));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to verify the code.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSubmitting(true);
    try {
      const next = await resendOtp(challenge.challengeId);
      setChallenge(next);
      return next;
    } catch (err) {
      setError(err.response?.data?.message || "Unable to resend the code.");
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      {/* LEFT SIDE - LOGIN FORM */}
      <div className="auth-card">
        <Link to="/" className="brand">
          PitchPilot AI
        </Link>

        {challenge ? (
          <OtpVerificationForm
            challenge={challenge}
            error={error}
            submitting={submitting}
            onVerify={handleVerify}
            onResend={handleResend}
            onCancel={() => { setChallenge(null); setError(""); }}
          />
        ) : (
          <>
        <span className="manager-login-label">
          SALES MANAGEMENT PORTAL
        </span>

        <h1>Welcome back, Manager</h1>

        <p className="auth-subtitle">
          Sign in to monitor your team's training progress,
          performance, and development.
        </p>

        {displayedError && (
          <div className="error-message" role="alert">
            {displayedError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="manager-email">
              Email
            </label>

            <input
              id="manager-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="manager@company.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="manager-password">
              Password
            </label>

            <PasswordInput
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
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
            {submitting
              ? "Signing in..."
              : "Sign In as Manager"}
          </button>
        </form>

        {/* GOOGLE SIGN-IN */}
        <div className="manager-google-login">
          <SocialLogin />
        </div>

        {/* AGENT LOGIN LINK */}
        <p className="auth-footer">
          Are you a sales agent?{" "}
          <Link to="/login">
            Agent Login
          </Link>
        </p>

        <p className="manager-login-note">
          Manager accounts are provided by your administrator.
        </p>
          </>
        )}
      </div>

      {/* RIGHT SIDE - GREEN HILLS LANDSCAPE */}
      <div className="auth-image-panel auth-manager-image">
        <div className="auth-image-overlay">
          <span>LEAD WITH CONFIDENCE</span>

          <h2>
            Lead with vision. Grow with purpose.
          </h2>

          <p>
            Empower your team, inspire progress,
            and turn every conversation into growth.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ManagerLogin;
