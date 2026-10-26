
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

function LoginPage() {
  const navigate = useNavigate();
  const { login, verifyOtp, resendOtp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [challenge, setChallenge] = useState(null);

  // Read and clear any authentication notice
  // saved before redirecting to login.
  const [authNotice, setAuthNotice] = useState(() => {
    const notice = sessionStorage.getItem(
      "pitchpilot_auth_notice"
    );

    if (notice) {
      sessionStorage.removeItem(
        "pitchpilot_auth_notice"
      );
    }

    return notice || "";
  });

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

  // ==========================================
  // LOGIN
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setAuthNotice("");
    setSubmitting(true);

    try {
      const result = await login(email, password);

      // The backend sends an OTP challenge
      // before completing authentication.
      if (result?.requiresOtp && result?.challengeId) {
        setChallenge(result);
      } else if (result?.user) {
        finishLogin(result);
      } else {
        setError("Unexpected login response.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to sign in. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // REDIRECT AFTER LOGIN
  // ==========================================

  const finishLogin = (result) => {
    const role = result?.user?.role;

    switch (role) {
      case "admin":
        navigate("/admin/dashboard", {
          replace: true,
        });
        break;

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
        setError(
          "Your account role could not be verified."
        );
    }
  };

  // ==========================================
  // VERIFY LOGIN OTP
  // ==========================================

  const handleVerify = async (code) => {
    setError("");
    setSubmitting(true);

    try {
      const result = await verifyOtp(
        challenge.challengeId,
        code
      );

      finishLogin(result);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to verify the code."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // RESEND OTP
  // ==========================================

  const handleResend = async () => {
    setError("");
    setSubmitting(true);

    try {
      const next = await resendOtp(
        challenge.challengeId
      );

      setChallenge(next);
      return next;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to resend the code."
      );

      return null;
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // LOGIN PAGE
  // ==========================================

  return (
    <div className="auth-page">
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
            onCancel={() => {
              setChallenge(null);
              setError("");
            }}
          />
        ) : (
          <>
            <h1>Welcome back</h1>

            <p className="auth-subtitle">
              Sign in to continue your sales training.
            </p>

            {/* ACCOUNT SUSPENSION NOTICE */}
            {authNotice && (
              <div
                className="error-message"
                role="alert"
                style={{
                  marginBottom: "18px",
                  padding: "14px 16px",
                  borderRadius: "10px",
                  lineHeight: "1.6",
                }}
              >
                {authNotice}
              </div>
            )}

            {/* LOGIN AND OAUTH ERRORS */}
            {displayedError && (
              <div
                className="error-message"
                role="alert"
              >
                {displayedError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* EMAIL */}
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
                  autoComplete="email"
                  required
                />
              </div>

              {/* PASSWORD */}
              <div className="form-group">
                <label htmlFor="password">
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

              {/* FORGOT PASSWORD */}
              <div
                style={{
                  textAlign: "right",
                  marginTop: "-8px",
                  marginBottom: "20px",
                }}
              >
                <Link
                  to="/forgot-password"
                  style={{
                    color: "#4f46e5",
                    fontSize: "14px",
                    fontWeight: "600",
                    textDecoration: "none",
                  }}
                >
                  Forgot password?
                </Link>
              </div>

              {/* SIGN IN */}
              <button
                className="auth-button"
                type="submit"
                disabled={submitting}
              >
                {submitting
                  ? "Signing in..."
                  : "Sign In"}
              </button>
            </form>

            {/* GOOGLE SIGN IN */}
            <SocialLogin />

            {/* CREATE ACCOUNT */}
            <p className="auth-footer">
              New to PitchPilot?{" "}
              <Link to="/register">
                Create an account
              </Link>
            </p>
          </>
        )}
      </div>

      {/* LOGIN LANDSCAPE IMAGE */}
      <div className="auth-image-panel auth-login-image">
        <div className="auth-image-overlay">
          <span>WELCOME BACK</span>

          <h2>
            Every great conversation starts somewhere.
          </h2>

          <p>
            Practice with purpose.
            Grow with confidence.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
