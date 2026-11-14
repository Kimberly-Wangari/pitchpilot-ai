
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";
import SocialLogin from "../components/SocialLogin";
import OtpVerificationForm from "../components/OtpVerificationForm";

function RegisterPage() {
  const navigate = useNavigate();
  const { register, verifyOtp, resendOtp } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [challenge, setChallenge] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      setChallenge(await register(formData));
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to create your account."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (code) => {
    setError("");
    setSubmitting(true);
    try {
      await verifyOtp(challenge.challengeId, code);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setError(error.response?.data?.message || "Unable to verify the code.");
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
    } catch (error) {
      setError(error.response?.data?.message || "Unable to resend the code.");
      return null;
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
        <h1>Create your account</h1>

        <p className="auth-subtitle">
          Start practicing realistic sales conversations.
        </p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">
                First name
              </label>

              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                autoComplete="given-name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">
                Last name
              </label>

              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                autoComplete="family-name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <PasswordInput
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              autoComplete="new-password"
              minLength={8}
              required
            />

            <small>
              Use at least 8 characters.
            </small>
          </div>

          <button
            className="auth-button"
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "Creating account..."
              : "Create Account"}
          </button>
        </form>

        <SocialLogin />

                <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">
            Sign in
          </Link>
        </p>
          </>
        )}
      </div>

      {/* Registration landscape image */}
      <div className="auth-image-panel auth-register-image">
        <div className="auth-image-overlay">
          <span>YOUR JOURNEY STARTS HERE</span>
          <h2>Confidence begins with practice.</h2>
          <p>Take the first step towards stronger sales conversations.</p>
        </div>
      </div>
    </div>
     
  );
}

export default RegisterPage;
