
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./ManagerActivation.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

function ManagerActivation() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading");
  const [manager, setManager] = useState(null);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function validateInvitation() {
      if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
        setStatus("invalid");
        setError("This invitation link is invalid.");
        return;
      }

      try {
        setStatus("loading");

        const response = await fetch(
          `${API_BASE_URL}/api/auth/manager-invitation?token=${encodeURIComponent(token)}`,
          {
            method: "GET",
            signal: controller.signal,
            headers: {
              Accept: "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok || !data.valid) {
          throw new Error(
            data.message ||
              "This invitation is invalid or has expired."
          );
        }

        if (!controller.signal.aborted) {
          setManager(data.manager);
          setStatus("valid");
          setError("");
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        setStatus("invalid");
        setError(
          err.message || "Unable to validate your invitation."
        );
      }
    }

    validateInvitation();

    return () => controller.abort();
  }, [token]);

  async function handleActivation(event) {
    event.preventDefault();
    setError("");

    if (submitting) return;

    if (password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }

    if (new TextEncoder().encode(password).length > 72) {
      setError("Your password is too long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `${API_BASE_URL}/api/auth/activate-manager`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Account activation failed."
        );
      }

      setPassword("");
      setConfirmPassword("");
      setStatus("success");

      // Remove the one-time token from browser history.
      window.history.replaceState(
        window.history.state,
        "",
        "/manager/activate"
      );
    } catch (err) {
      setError(
        err.message || "Unable to activate your account."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="manager-activation-page">
      <section className="manager-activation-card">
        <Link
          to="/"
          className="manager-activation-brand"
        >
          PitchPilot <span>AI</span>
        </Link>

        {status === "loading" && (
          <div
            className="manager-activation-state"
            role="status"
          >
            <div className="manager-activation-spinner" />
            <h1>Checking your invitation</h1>
            <p>
              Please wait while we verify your
              account activation link.
            </p>
          </div>
        )}

        {status === "invalid" && (
          <div className="manager-activation-state">
            <div className="manager-activation-symbol">
              !
            </div>

            <h1>Invitation unavailable</h1>

            <p role="alert">
              {error ||
                "Your invitation has expired or is no longer valid."}
            </p>

            <p>
              Contact your PitchPilot AI administrator
              for assistance.
            </p>

            <Link
              to="/login"
              className="manager-activation-link-button"
            >
              Go to Login
            </Link>
          </div>
        )}

        {status === "valid" && (
          <>
            <div className="manager-activation-heading">
              <span className="manager-activation-eyebrow">
                SALES MANAGER INVITATION
              </span>

              <h1>Activate your account</h1>

              <p>
                Welcome
                {manager?.firstName
                  ? `, ${manager.firstName}`
                  : ""}
                ! Create your password to get
                started with PitchPilot AI.
              </p>
            </div>

            {manager?.email && (
              <div className="manager-activation-email">
                <span>Invited email</span>
                <strong>{manager.email}</strong>
              </div>
            )}

            <form onSubmit={handleActivation}>
              <div className="manager-activation-field">
                <label htmlFor="manager-password">
                  Create password
                </label>

                <input
                  id="manager-password"
                  type={
                    showPassword ? "text" : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={submitting}
                />

                <small>
                  Use at least 8 characters.
                </small>
              </div>

              <div className="manager-activation-field">
                <label htmlFor="manager-confirm-password">
                  Confirm password
                </label>

                <input
                  id="manager-confirm-password"
                  type={
                    showPassword ? "text" : "password"
                  }
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  required
                  disabled={submitting}
                />
              </div>

              <label className="manager-activation-toggle">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(event) =>
                    setShowPassword(event.target.checked)
                  }
                />
                Show passwords
              </label>

              {error && (
                <div
                  className="manager-activation-error"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="manager-activation-submit"
                disabled={submitting}
              >
                {submitting
                  ? "Activating account..."
                  : "Activate Account"}
              </button>
            </form>

            <p className="manager-activation-footer">
              Already activated your account?{" "}
              <Link to="/login">Sign in</Link>
            </p>
          </>
        )}

        {status === "success" && (
          <div
            className="manager-activation-state"
            role="status"
          >
            <div className="manager-activation-symbol manager-activation-success">
              ✓
            </div>

            <h1>Account activated!</h1>

            <p>
              Your Sales Manager account is now active.
              You can sign in using your email and
              new password.
            </p>

            <Link
              to="/login"
              className="manager-activation-link-button"
            >
              Continue to Login
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

export default ManagerActivation;
