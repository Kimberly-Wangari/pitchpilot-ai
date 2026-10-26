import { useEffect, useState } from "react";

function OtpVerificationForm({
  challenge,
  error,
  submitting,
  onVerify,
  onResend,
  onCancel,
}) {
  const [code, setCode] = useState("");
  const [resendIn, setResendIn] = useState(
    challenge.resendAfterSeconds || 60
  );

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const timer = window.setInterval(() => {
      setResendIn((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendIn]);

  const submit = (event) => {
    event.preventDefault();
    onVerify(code);
  };

  const resend = async () => {
    const next = await onResend();
    if (next) {
      setCode("");
      setResendIn(next.resendAfterSeconds || 60);
    }
  };

  return (
    <div className="otp-panel">
      <h1>Check your email</h1>
      <p className="auth-subtitle">
        Enter the 6-digit code sent to <strong>{challenge.email}</strong>.
        It expires in 10 minutes.
      </p>

      {error && <div className="error-message" role="alert">{error}</div>}

      <form onSubmit={submit}>
        <div className="form-group">
          <label htmlFor="otp-code">Verification code</label>
          <input
            id="otp-code"
            className="otp-input"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            value={code}
            onChange={(event) =>
              setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            autoFocus
            required
          />
        </div>

        <button
          className="auth-button"
          type="submit"
          disabled={submitting || code.length !== 6}
        >
          {submitting ? "Verifying..." : "Verify code"}
        </button>
      </form>

      <div className="otp-actions">
        <button type="button" className="link-button" onClick={resend} disabled={submitting || resendIn > 0}>
          {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
        </button>
        <button type="button" className="link-button" onClick={onCancel} disabled={submitting}>
          Start over
        </button>
      </div>
    </div>
  );
}

export default OtpVerificationForm;
