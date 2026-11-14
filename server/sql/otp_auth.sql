
-- ============================================
-- PITCHPILOT AI
-- PASSWORD RESET OTP MIGRATION
-- ============================================

BEGIN;

-- Add columns needed for password resetting.
ALTER TABLE otp_challenges
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

ALTER TABLE otp_challenges
ADD COLUMN IF NOT EXISTS reset_token_hash TEXT;

-- Allow OTPs for registration, login and password resets.
ALTER TABLE otp_challenges
DROP CONSTRAINT IF EXISTS otp_challenges_purpose_check;

ALTER TABLE otp_challenges
ADD CONSTRAINT otp_challenges_purpose_check
CHECK (purpose IN ('register', 'login', 'reset'));

-- Improve OTP lookup performance.
CREATE INDEX IF NOT EXISTS
idx_otp_challenges_user_purpose
ON otp_challenges(user_id, purpose);

COMMIT;
