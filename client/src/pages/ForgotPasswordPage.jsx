
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [resetToken, setResetToken] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function postRequest(path, body) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || "Something went wrong. Please try again."
      );
    }

    return data;
  }

  // STEP 1: Request password-reset OTP
  async function handleRequestCode(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await postRequest("/api/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      setChallengeId(data.challengeId || "");
      setSuccess(
        data.message ||
          "If your email is registered, a code will be sent."
      );
      setStep("otp");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // STEP 2: Verify the OTP
  async function handleVerifyCode(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await postRequest("/api/auth/verify-reset", {
        challengeId,
        code: code.trim(),
      });
if (!data.resetToken) {
  throw new Error(
    "Verification succeeded, but no reset token was returned."
  );
}
      setResetToken(data.resetToken);
      setSuccess("Email verified! You can now set a new password.");
      setStep("password");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // STEP 3: Save the new password
  async function handleResetPassword(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const data = await postRequest("/api/auth/reset-password", {
        challengeId,
        resetToken,
        newPassword,
        confirmPassword,
      });

      setSuccess(data.message || "Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
      setResetToken("");
      setStep("complete");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleStartOver() {
    setStep("email");
    setCode("");
    setChallengeId("");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>PitchPilot AI</div>

        {step !== "complete" && (
          <>
            <h1 style={styles.heading}>Forgot Password?</h1>
            <p style={styles.subtitle}>
              Securely reset your PitchPilot AI password.
            </p>

            <div style={styles.steps}>
              {["email", "otp", "password"].map((item, index) => (
                <div
                  key={item}
                  style={{
                    ...styles.stepIndicator,
                    background:
                      ["email", "otp", "password"].indexOf(step) >=
                      index
                        ? "#6366f1"
                        : "#e5e7eb",
                  }}
                />
              ))}
            </div>
          </>
        )}

        {error && (
          <div role="alert" style={styles.error}>
            {error}
          </div>
        )}

        {success && (
          <div role="status" style={styles.success}>
            {success}
          </div>
        )}

        {step === "email" && (
          <form onSubmit={handleRequestCode}>
            <label htmlFor="reset-email" style={styles.label}>
              Email address
            </label>

            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              autoComplete="email"
              required
              style={styles.input}
            />

            <button
              type="submit"
              disabled={loading}
              style={styles.button}
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyCode}>
            <p style={styles.description}>
              If an eligible account exists for{" "}
              <strong>{email}</strong>, a six-digit code has
              been sent to that address.
            </p>

            <label htmlFor="reset-code" style={styles.label}>
              Verification code
            </label>

            <input
              id="reset-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, ""))
              }
              placeholder="Enter 6-digit code"
              required
              style={{
                ...styles.input,
                textAlign: "center",
                letterSpacing: "6px",
                fontSize: "20px",
              }}
            />

            <button
              type="submit"
              disabled={
                loading ||
                code.length !== 6 ||
                !challengeId
              }
              style={styles.button}
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>

            <button
              type="button"
              onClick={handleStartOver}
              style={styles.textButton}
            >
              Start again
            </button>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={handleResetPassword}>
            <p style={styles.description}>
              Your email has been verified. Choose a new password
              for your account.
            </p>

            <label htmlFor="new-password" style={styles.label}>
              New password
            </label>

            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
              style={styles.input}
            />

            <label htmlFor="confirm-password" style={styles.label}>
              Confirm new password
            </label>

            <input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Confirm new password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
              style={styles.input}
            />

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) =>
                  setShowPassword(e.target.checked)
                }
              />
              Show passwords
            </label>

            <button
              type="submit"
              disabled={
                loading ||
                newPassword.length < 8 ||
                newPassword !== confirmPassword
              }
              style={styles.button}
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}

        {step === "complete" && (
          <div style={{ textAlign: "center" }}>
            <div style={styles.successIcon}>✓</div>

            <h1 style={styles.heading}>Password Reset!</h1>

            <p style={styles.subtitle}>
              Your password has been updated successfully.
              You can now log in with your new password.
            </p>

            <button
              type="button"
              onClick={() => navigate("/login")}
              style={styles.button}
            >
              Back to Login
            </button>
          </div>
        )}

        {step !== "complete" && (
          <div style={styles.footer}>
            Remember your password?{" "}
            <Link to="/login" style={styles.link}>
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
    padding: "24px",
    fontFamily: "Arial, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "440px",
    background: "#ffffff",
    padding: "36px",
    borderRadius: "16px",
    boxShadow: "0 10px 35px rgba(0,0,0,0.07)",
  },

  logo: {
    textAlign: "center",
    fontSize: "24px",
    fontWeight: "800",
    color: "#4f46e5",
    marginBottom: "28px",
  },

  heading: {
    fontSize: "26px",
    fontWeight: "700",
    marginBottom: "10px",
    color: "#111827",
  },

  subtitle: {
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.7,
    marginBottom: "24px",
  },

  description: {
    color: "#475569",
    fontSize: "14px",
    lineHeight: 1.7,
    marginBottom: "20px",
    overflowWrap: "anywhere",
  },

  steps: {
    display: "flex",
    gap: "8px",
    marginBottom: "28px",
  },

  stepIndicator: {
    height: "5px",
    flex: 1,
    borderRadius: "10px",
  },

  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
  },

  input: {
    boxSizing: "border-box",
    width: "100%",
    padding: "13px 14px",
    marginBottom: "20px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
    outlineColor: "#6366f1",
  },

  button: {
    width: "100%",
    padding: "14px",
    background: "#4f46e5",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "8px",
  },

  textButton: {
    display: "block",
    margin: "18px auto 0",
    background: "none",
    border: "none",
    color: "#4f46e5",
    fontSize: "14px",
    cursor: "pointer",
  },

  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "#475569",
    marginBottom: "12px",
  },

  error: {
    padding: "12px",
    borderRadius: "8px",
    background: "#fef2f2",
    color: "#b91c1c",
    fontSize: "13px",
    marginBottom: "18px",
  },

  success: {
    padding: "12px",
    borderRadius: "8px",
    background: "#f0fdf4",
    color: "#166534",
    fontSize: "13px",
    marginBottom: "18px",
  },

  successIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "#dcfce7",
    color: "#16a34a",
    fontSize: "36px",
    lineHeight: "60px",
    margin: "0 auto 20px",
  },

  footer: {
    textAlign: "center",
    marginTop: "28px",
    fontSize: "13px",
    color: "#64748b",
  },

  link: {
    color: "#4f46e5",
    textDecoration: "none",
    fontWeight: "600",
  },
};
