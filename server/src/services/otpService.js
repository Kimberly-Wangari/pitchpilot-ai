const crypto = require("crypto");

const OTP_EXPIRY_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_SECONDS = 60;

function getSecret() {
  const secret = process.env.OTP_HASH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("OTP_HASH_SECRET must contain at least 32 characters.");
  }

  return secret;
}

function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashOtp(challengeId, code) {
  return crypto
    .createHmac("sha256", getSecret())
    .update(`${challengeId}:${code}`)
    .digest("hex");
}

function otpMatches(challengeId, code, expectedHash) {
  const actual = Buffer.from(hashOtp(challengeId, code), "hex");
  const expected = Buffer.from(expectedHash, "hex");

  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function maskEmail(email) {
  const [local, domain] = email.split("@");
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(Math.max(1, local.length - visible.length))}@${domain}`;
}

module.exports = {
  OTP_EXPIRY_MINUTES,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_SECONDS,
  generateOtp,
  hashOtp,
  otpMatches,
  maskEmail,
};
