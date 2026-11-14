const bcrypt = require("bcryptjs");

const crypto = require("crypto");

const pool = require("../config/database");

const { sendOtpEmail } = require("../services/emailService");



const {

  OTP_EXPIRY_MINUTES,

  OTP_MAX_ATTEMPTS,

  OTP_RESEND_SECONDS,

  generateOtp,

  hashOtp,

  otpMatches,

  maskEmail,

} = require("../services/otpService");



const generateToken = require("../utils/generateToken");



// Format user information without exposing the password.

const formatUser = (user) => ({

  id: user.id,

  firstName: user.first_name,

  lastName: user.last_name,

  email: user.email,

  role: user.role,

});



// Create a new OTP challenge.

async function createChallenge(client, user, purpose) {

  const challengeId = crypto.randomUUID();

  const code = generateOtp();



  // Invalidate previous unused codes for this purpose.

  await client.query(

    `UPDATE otp_challenges

     SET consumed_at = NOW()

     WHERE user_id = $1

       AND purpose = $2

       AND consumed_at IS NULL`,

    [user.id, purpose]

  );



  await client.query(

    `INSERT INTO otp_challenges

       (id, user_id, purpose, code_hash, expires_at)

     VALUES

       ($1, $2, $3, $4, NOW() + ($5 * INTERVAL '1 minute'))`,

    [

      challengeId,

      user.id,

      purpose,

      hashOtp(challengeId, code),

      OTP_EXPIRY_MINUTES,

    ]

  );



  return { challengeId, code };

}



function challengeResponse(user, purpose, challengeId) {

  return {

    message: "A verification code has been sent to your email.",

    requiresOtp: true,

    challengeId,

    purpose,

    email: maskEmail(user.email),

    expiresInSeconds: OTP_EXPIRY_MINUTES * 60,

    resendAfterSeconds: OTP_RESEND_SECONDS,

  };

}



// ======================================================

// REGISTER

// ======================================================



async function register(req, res) {

  let client;



  try {

    const { firstName, lastName, email, password } = req.body || {};



    if (

      typeof firstName !== "string" ||

      typeof lastName !== "string" ||

      typeof email !== "string" ||

      typeof password !== "string" ||

      !firstName.trim() ||

      !lastName.trim() ||

      !email.trim()

    ) {

      return res.status(400).json({

        message: "All fields are required.",

      });

    }



    if (password.length < 8 || password.length > 128) {

      return res.status(400).json({

        message: "Password must contain 8–128 characters.",

      });

    }



    const normalizedEmail = email.trim().toLowerCase();



    if (

      normalizedEmail.length > 254 ||

      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)

    ) {

      return res.status(400).json({

        message: "Enter a valid email address.",

      });

    }



    client = await pool.connect();

    await client.query("BEGIN");



    const existing = await client.query(

      `SELECT id, email, password_hash, email_verified,

              first_name, last_name, role

       FROM users

       WHERE email = $1

       FOR UPDATE`,

      [normalizedEmail]

    );



    let user;

    let statusCode = 201;



    if (existing.rowCount > 0) {

      const oldUser = existing.rows[0];



      if (oldUser.email_verified) {

        await client.query("ROLLBACK");



        return res.status(409).json({

          message: "An account with this email already exists.",

        });

      }



      // Allow an unverified account to continue registration

      // only when the original password is supplied.

      const samePassword =

        oldUser.password_hash &&

        (await bcrypt.compare(password, oldUser.password_hash));



      if (!samePassword) {

        await client.query("ROLLBACK");



        return res.status(409).json({

          message:

            "An account with this email already exists. Use the original password to complete verification.",

        });

      }



      const recent = await client.query(

        `SELECT created_at

         FROM otp_challenges

         WHERE user_id = $1 AND purpose = 'register'

         ORDER BY created_at DESC

         LIMIT 1`,

        [oldUser.id]

      );



      if (

        recent.rowCount > 0 &&

        Date.now() - new Date(recent.rows[0].created_at).getTime() <

          OTP_RESEND_SECONDS * 1000

      ) {

        await client.query("ROLLBACK");



        return res.status(429).json({

          message:

            "Please wait before requesting another verification code.",

        });

      }



      user = oldUser;

      statusCode = 200;

    } else {

      const passwordHash = await bcrypt.hash(password, 12);



      const created = await client.query(

        `INSERT INTO users

           (first_name, last_name, email,

            password_hash, role, email_verified)

         VALUES ($1, $2, $3, $4, 'agent', FALSE)

         RETURNING id, first_name, last_name, email, role`,

        [

          firstName.trim(),

          lastName.trim(),

          normalizedEmail,

          passwordHash,

        ]

      );



      user = created.rows[0];

    }



    const challenge = await createChallenge(

      client,

      user,

      "register"

    );



    await client.query("COMMIT");



    await sendOtpEmail({

      email: user.email,

      code: challenge.code,

      purpose: "register",

    });



    return res.status(statusCode).json(

      challengeResponse(

        user,

        "register",

        challenge.challengeId

      )

    );

  } catch (error) {

    if (client) {

      await client.query("ROLLBACK").catch(() => {});

    }



    console.error("Registration error:", error);



    return res.status(500).json({

      message:

        "Unable to create account or send the verification email.",

    });

  } finally {

    if (client) client.release();

  }

}



// LOGIN

async function login(req, res) {

  try {

    const { email, password } = req.body || {};



    if (

      typeof email !== "string" ||

      typeof password !== "string" ||

      !email.trim() ||

      !password

    ) {

      return res.status(400).json({

        message: "Email and password are required.",

      });

    }



    const result = await pool.query(

      `SELECT id, first_name, last_name, email,

              password_hash, role, is_active,

              email_verified

       FROM users

       WHERE email = $1`,

      [email.trim().toLowerCase()]

    );



    if (result.rowCount === 0) {

      return res.status(401).json({

        message: "Invalid email or password.",

      });

    }



    const user = result.rows[0];



    const matches = user.password_hash

      ? await bcrypt.compare(password, user.password_hash)

      : false;



    if (!matches) {

      return res.status(401).json({

        message: "Invalid email or password.",

      });

    }



    if (!user.is_active) {

      return res.status(403).json({

        message: "This account is inactive.",

      });

    }



    if (!user.email_verified) {

      return res.status(403).json({

        message:

          "Verify your email before signing in. Return to Create an account with your original details to request another code.",

      });

    }



    const client = await pool.connect();

    let challenge;



    try {

      await client.query("BEGIN");



      challenge = await createChallenge(

        client,

        user,

        "login"

      );



      await client.query("COMMIT");

    } catch (error) {

      await client.query("ROLLBACK").catch(() => {});

      throw error;

    } finally {

      client.release();

    }



    try {

      await sendOtpEmail({

        email: user.email,

        code: challenge.code,

        purpose: "login",

      });

    } catch (error) {

      await pool.query(

        "DELETE FROM otp_challenges WHERE id = $1",

        [challenge.challengeId]

      );



      throw error;

    }



    return res.status(200).json(

      challengeResponse(

        user,

        "login",

        challenge.challengeId

      )

    );

  } catch (error) {

    console.error("Login error:", error);



    return res.status(500).json({

      message:

        "Unable to login or send the verification email.",

    });

  }

}

// VERIFY REGISTRATION OR LOGIN OTP

async function verifyOtp(req, res) {

  let client;



  try {

    const { challengeId, code } = req.body || {};



    if (

      !challengeId ||

      !/^\d{6}$/.test(String(code || ""))

    ) {

      return res.status(400).json({

        message: "Enter a valid 6-digit code.",

      });

    }



    client = await pool.connect();

    await client.query("BEGIN");



    const result = await client.query(

      `SELECT c.*, u.first_name, u.last_name,

              u.email, u.role, u.is_active,

              u.email_verified

       FROM otp_challenges c

       JOIN users u ON u.id = c.user_id

       WHERE c.id = $1

       FOR UPDATE OF c, u`,

      [challengeId]

    );



    if (result.rowCount !== 1) {

      await client.query("ROLLBACK");



      return res.status(400).json({

        message: "This verification request is invalid.",

      });

    }



    const challenge = result.rows[0];



    // Password-reset OTPs must use the separate reset endpoint.

    if (!["register", "login"].includes(challenge.purpose)) {

      await client.query("ROLLBACK");



      return res.status(400).json({

        message: "Invalid verification purpose.",

      });

    }



    if (

      challenge.consumed_at ||

      new Date(challenge.expires_at) <= new Date()

    ) {

      await client.query("ROLLBACK");



      return res.status(410).json({

        message: "This code has expired. Request a new code.",

      });

    }



    if (challenge.attempts >= OTP_MAX_ATTEMPTS) {

      await client.query("ROLLBACK");



      return res.status(429).json({

        message: "Too many attempts. Request a new code.",

      });

    }



    if (

      !otpMatches(

        challengeId,

        String(code),

        challenge.code_hash

      )

    ) {

      const attempts = challenge.attempts + 1;



      await client.query(

        `UPDATE otp_challenges

         SET attempts = $2,

             consumed_at =

               CASE

                 WHEN $2 >= $3 THEN NOW()

                 ELSE consumed_at

               END

         WHERE id = $1`,

        [

          challengeId,

          attempts,

          OTP_MAX_ATTEMPTS,

        ]

      );



      await client.query("COMMIT");



      return res.status(401).json({

        message:

          attempts >= OTP_MAX_ATTEMPTS

            ? "Too many attempts. Request a new code."

            : `Incorrect code. ${

                OTP_MAX_ATTEMPTS - attempts

              } attempts remaining.`,

      });

    }



    if (!challenge.is_active) {

      await client.query("ROLLBACK");



      return res.status(403).json({

        message: "This account is inactive.",

      });

    }



    if (

      challenge.purpose === "login" &&

      !challenge.email_verified

    ) {

      await client.query("ROLLBACK");



      return res.status(403).json({

        message: "This email address is not verified.",

      });

    }



    await client.query(

      `UPDATE otp_challenges

       SET consumed_at = NOW()

       WHERE id = $1`,

      [challengeId]

    );



    if (challenge.purpose === "register") {

      await client.query(

        `UPDATE users

         SET email_verified = TRUE

         WHERE id = $1`,

        [challenge.user_id]

      );

    }



    await client.query("COMMIT");



    const user = {

      id: challenge.user_id,

      first_name: challenge.first_name,

      last_name: challenge.last_name,

      email: challenge.email,

      role: challenge.role,

    };



    return res.status(200).json({

      message:

        challenge.purpose === "register"

          ? "Email verified and account created successfully."

          : "Login successful.",

      token: generateToken(user),

      user: formatUser(user),

    });

  } catch (error) {

    if (client) {

      await client.query("ROLLBACK").catch(() => {});

    }



    console.error("OTP verification error:", error);



    return res.status(500).json({

      message: "Unable to verify the code.",

    });

  } finally {

    if (client) client.release();

  }

}



// RESEND OTP

async function resendOtp(req, res) {

  let client;



  try {

    const { challengeId } = req.body || {};



    if (!challengeId) {

      return res.status(400).json({

        message: "A challenge ID is required.",

      });

    }



    client = await pool.connect();

    await client.query("BEGIN");



    const result = await client.query(

      `SELECT c.user_id, c.purpose, c.created_at,

              c.consumed_at, c.verified_at,

              u.id, u.email, u.is_active,

              u.email_verified

       FROM otp_challenges c

       JOIN users u ON u.id = c.user_id

       WHERE c.id = $1

       FOR UPDATE OF c, u`,

      [challengeId]

    );



    if (result.rowCount !== 1) {

      await client.query("ROLLBACK");



      return res.status(400).json({

        message: "This verification request is invalid.",

      });

    }



    const previous = result.rows[0];



    if (

      previous.consumed_at ||

      previous.verified_at

    ) {

      await client.query("ROLLBACK");



      return res.status(400).json({

        message: "Start a new verification request.",

      });

    }



    const elapsed =

      (Date.now() -

        new Date(previous.created_at).getTime()) / 1000;



    if (elapsed < OTP_RESEND_SECONDS) {

      await client.query("ROLLBACK");



      return res.status(429).json({

        message: `Wait ${Math.ceil(

          OTP_RESEND_SECONDS - elapsed

        )} seconds before requesting another code.`,

      });

    }



    if (!previous.is_active) {

      await client.query("ROLLBACK");



      return res.status(403).json({

        message: "This account is inactive.",

      });

    }



    const next = await createChallenge(

      client,

      previous,

      previous.purpose

    );



    await client.query("COMMIT");



    try {

      await sendOtpEmail({

        email: previous.email,

        code: next.code,

        purpose: previous.purpose,

      });

    } catch (error) {

      await pool.query(

        "DELETE FROM otp_challenges WHERE id = $1",

        [next.challengeId]

      );



      throw error;

    }



    return res.status(200).json(

      challengeResponse(

        previous,

        previous.purpose,

        next.challengeId

      )

    );

  } catch (error) {

    if (client) {

      await client.query("ROLLBACK").catch(() => {});

    }



    console.error("OTP resend error:", error);



    return res.status(500).json({

      message: "Unable to resend the verification code.",

    });

  } finally {

    if (client) client.release();

  }

}



// GET CURRENT USER

async function getCurrentUser(req, res) {

  try {

    const result = await pool.query(

      `SELECT id, first_name, last_name, email,

              role, is_active, email_verified,

              created_at

       FROM users

       WHERE id = $1`,

      [req.user.id]

    );



    if (result.rowCount === 0) {

      return res.status(404).json({

        message: "User not found.",

      });

    }



    const user = result.rows[0];



    return res.status(200).json({

      user: {

        ...formatUser(user),

        isActive: user.is_active,

        emailVerified: user.email_verified,

        createdAt: user.created_at,

      },

    });

  } catch (error) {

    console.error("Get current user error:", error);



    return res.status(500).json({

      message: "Unable to retrieve user.",

    });

  }

}



// ======================================================
// UPDATE AUTHENTICATED PROFILE NAMES
// PATCH /api/auth/profile
// ======================================================
async function updateProfile(req, res) {
  try {
    const { firstName, lastName } = req.body || {};

    if (
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      !firstName.trim() ||
      !lastName.trim() ||
      firstName.trim().length > 100 ||
      lastName.trim().length > 100
    ) {
      return res.status(400).json({
        message: "First and last names are required and must each be 100 characters or fewer.",
      });
    }

    const result = await pool.query(
      `UPDATE users
       SET first_name = $1,
           last_name = $2,
           updated_at = NOW()
       WHERE id = $3
         AND is_active = TRUE
         AND email_verified = TRUE
       RETURNING id, first_name, last_name, email, role,
                 is_active, email_verified, created_at`,
      [firstName.trim(), lastName.trim(), req.user.id]
    );

    if (result.rowCount !== 1) {
      return res.status(403).json({
        message: "Your account is not eligible for profile updates.",
      });
    }

    const user = result.rows[0];
    return res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        ...formatUser(user),
        isActive: user.is_active,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      message: "Unable to update your profile.",
    });
  }
}

// FORGOT PASSWORD — REQUEST CODE

const RESET_REQUEST_MESSAGE =

  "If this email belongs to an eligible account, a password reset code will be sent.";



async function requestPasswordReset(req, res) {

  const email =

    typeof req.body?.email === "string"

      ? req.body.email.trim().toLowerCase()

      : "";



  if (

    email.length > 254 ||

    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  ) {

    return res.status(400).json({

      message: "Enter a valid email address.",

    });

  }



  try {

    const result = await pool.query(

      `SELECT id, email

       FROM users

       WHERE email = $1

         AND is_active = TRUE

         AND email_verified = TRUE`,

      [email]

    );



    // Avoid revealing whether an email is registered.

    if (!result.rowCount) {

      return res.json({

        message: RESET_REQUEST_MESSAGE,

      });

    }



    const user = result.rows[0];



    const recent = await pool.query(

      `SELECT created_at

       FROM otp_challenges

       WHERE user_id = $1

         AND purpose = 'reset'

       ORDER BY created_at DESC

       LIMIT 1`,

      [user.id]

    );



    if (

      recent.rowCount &&

      Date.now() -

        new Date(recent.rows[0].created_at).getTime() <

        OTP_RESEND_SECONDS * 1000

    ) {

      return res.json({

        message: RESET_REQUEST_MESSAGE,

      });

    }



    const client = await pool.connect();

    let challenge;



    try {

      await client.query("BEGIN");



      challenge = await createChallenge(

        client,

        user,

        "reset"

      );



      await client.query("COMMIT");

    } catch (error) {

      await client.query("ROLLBACK").catch(() => {});

      throw error;

    } finally {

      client.release();

    }



    await sendOtpEmail({

      email: user.email,

      code: challenge.code,

      purpose: "reset",

    });



    return res.json({

      message: RESET_REQUEST_MESSAGE,

      challengeId: challenge.challengeId,

    });

  } catch (error) {

    console.error("Password reset request error:", error);



    return res.status(500).json({

      message: "Unable to process the request right now.",

    });

  }

}



// FORGOT PASSWORD — VERIFY CODE

async function verifyPasswordReset(req, res) {

  const { challengeId, code } = req.body || {};



  if (

    !/^[0-9a-f-]{36}$/i.test(String(challengeId || "")) ||

    !/^\d{6}$/.test(String(code || ""))

  ) {

    return res.status(400).json({

      message: "Enter the six-digit code.",

    });

  }



  const client = await pool.connect();



  try {

    await client.query("BEGIN");



    const found = await client.query(

      `SELECT c.*, u.is_active, u.email_verified

       FROM otp_challenges c

       JOIN users u ON u.id = c.user_id

       WHERE c.id = $1

         AND c.purpose = 'reset'

       FOR UPDATE OF c`,

      [challengeId]

    );



    if (!found.rowCount) {

      await client.query("ROLLBACK");



      return res.status(400).json({

        message: "Invalid or expired verification request.",

      });

    }



    const challenge = found.rows[0];



    if (

      challenge.consumed_at ||

      challenge.verified_at ||

      new Date(challenge.expires_at) <= new Date() ||

      !challenge.is_active ||

      !challenge.email_verified

    ) {

      await client.query("ROLLBACK");



      return res.status(410).json({

        message: "This code is no longer valid. Start again.",

      });

    }



    if (challenge.attempts >= OTP_MAX_ATTEMPTS) {

      await client.query("ROLLBACK");



      return res.status(429).json({

        message: "Too many attempts. Start again.",

      });

    }



    if (

      !otpMatches(

        challengeId,

        String(code),

        challenge.code_hash

      )

    ) {

      await client.query(

        `UPDATE otp_challenges

         SET attempts = attempts + 1,

             consumed_at =

               CASE

                 WHEN attempts + 1 >= $2 THEN NOW()

                 ELSE consumed_at

               END

         WHERE id = $1`,

        [challengeId, OTP_MAX_ATTEMPTS]

      );



      await client.query("COMMIT");



      return res.status(401).json({

        message: "Incorrect verification code.",

      });

    }



    // Create a short-lived reset credential.

    const resetToken = crypto

      .randomBytes(32)

      .toString("hex");



    const tokenHash = crypto

      .createHash("sha256")

      .update(resetToken)

      .digest("hex");



    await client.query(

      `UPDATE otp_challenges

       SET verified_at = NOW(),

           reset_token_hash = $2

       WHERE id = $1`,

      [challengeId, tokenHash]

    );



    await client.query("COMMIT");



    return res.json({

      message: "Email verified. Enter your new password.",

      resetToken,

    });

  } catch (error) {

    await client.query("ROLLBACK").catch(() => {});



    console.error("Reset verification error:", error);



    return res.status(500).json({

      message: "Unable to verify the code.",

    });

  } finally {

    client.release();

  }

}



// FORGOT PASSWORD — SAVE NEW PASSWORD

async function completePasswordReset(req, res) {

  const {

    challengeId,

    resetToken,

    newPassword,

    confirmPassword,

  } = req.body || {};



  if (

    typeof newPassword !== "string" ||

    newPassword.length < 8 ||

    newPassword.length > 128 ||

    newPassword !== confirmPassword

  ) {

    return res.status(400).json({

      message:

        "Passwords must match and contain 8–128 characters.",

    });

  }



  if (

    !/^[0-9a-f-]{36}$/i.test(String(challengeId || "")) ||

    !/^[0-9a-f]{64}$/i.test(String(resetToken || ""))

  ) {

    return res.status(400).json({

      message: "Invalid password reset session.",

    });

  }



  const client = await pool.connect();



  try {

    await client.query("BEGIN");



    const found = await client.query(

      `SELECT c.*, u.is_active, u.email_verified

       FROM otp_challenges c

       JOIN users u ON u.id = c.user_id

       WHERE c.id = $1

         AND c.purpose = 'reset'

       FOR UPDATE OF c`,

      [challengeId]

    );



    if (!found.rowCount) {

      await client.query("ROLLBACK");



      return res.status(400).json({

        message: "Reset session expired. Start again.",

      });

    }



    const challenge = found.rows[0];



    const hash = crypto

      .createHash("sha256")

      .update(resetToken)

      .digest("hex");



    const expectedHash = challenge.reset_token_hash;



    const tokenMatches =

      typeof expectedHash === "string" &&

      /^[0-9a-f]{64}$/i.test(expectedHash) &&

      crypto.timingSafeEqual(

        Buffer.from(hash, "hex"),

        Buffer.from(expectedHash, "hex")

      );



    if (

      !challenge.verified_at ||

      !tokenMatches ||

      challenge.consumed_at ||

      new Date(challenge.expires_at) <= new Date() ||

      !challenge.is_active ||

      !challenge.email_verified

    ) {

      await client.query("ROLLBACK");



      return res.status(400).json({

        message: "Reset session expired. Start again.",

      });

    }



    const passwordHash = await bcrypt.hash(

      newPassword,

      12

    );



    // Update the password belonging to this OTP's user.

    await client.query(

      `UPDATE users

       SET password_hash = $1

       WHERE id = $2`,

      [passwordHash, challenge.user_id]

    );



    // Invalidate all outstanding OTP challenges.

    await client.query(

      `UPDATE otp_challenges

       SET consumed_at = NOW()

       WHERE user_id = $1

         AND consumed_at IS NULL`,

      [challenge.user_id]

    );



    await client.query("COMMIT");



    return res.json({

      message: "Password updated. You can now sign in.",

    });

  } catch (error) {

    await client.query("ROLLBACK").catch(() => {});



    console.error("Password reset completion error:", error);



    return res.status(500).json({

      message: "Unable to reset password.",

    });

  } finally {

    client.release();

  }

}





/* =====================================================

   SALES MANAGER INVITATION ACTIVATION

   ===================================================== */



const managerInviteCrypto = require("crypto");

const managerInviteBcrypt = require("bcryptjs");

const managerInvitePool = require("../config/database");



// Validate the format of an invitation token.

function isValidManagerInviteToken(token) {

  return (

    typeof token === "string" &&

    /^[a-f0-9]{64}$/i.test(token)

  );

}



// Hash invitation tokens before looking them up.

function hashManagerInviteToken(token) {

  return managerInviteCrypto

    .createHash("sha256")

    .update(token)

    .digest("hex");

}



/* =====================================================

   GET /api/auth/manager-invitation?token=...

   ===================================================== */



async function validateManagerInvitation(req, res) {

  try {

    const { token } = req.query;



    if (!isValidManagerInviteToken(token)) {

      return res.status(400).json({

        valid: false,

        message: "Invalid invitation link.",

      });

    }



    const tokenHash = hashManagerInviteToken(token);



    const result = await managerInvitePool.query(

      `

      SELECT

        mi.id,

        mi.expires_at,

        u.first_name,

        u.last_name,

        u.email

      FROM manager_invitations mi

      INNER JOIN users u

        ON u.id = mi.user_id

      WHERE mi.token_hash = $1

        AND mi.accepted_at IS NULL

        AND mi.expires_at > CURRENT_TIMESTAMP

        AND u.role = 'manager'

        AND u.is_active = FALSE

        AND u.email_verified = FALSE

        AND u.password_hash IS NULL

      LIMIT 1

      `,

      [tokenHash]

    );



    if (result.rowCount === 0) {

      return res.status(400).json({

        valid: false,

        message:

          "This invitation is invalid, expired, or already used.",

      });

    }



    const invitation = result.rows[0];



    return res.status(200).json({

      valid: true,

      message: "Invitation is valid.",

      manager: {

        firstName: invitation.first_name,

        lastName: invitation.last_name,

        email: invitation.email,

      },

      expiresAt: invitation.expires_at,

    });

  } catch (error) {

    console.error(

      "Manager invitation validation error:",

      error

    );



    return res.status(500).json({

      valid: false,

      message: "Unable to validate invitation.",

    });

  }

}



/* =====================================================

   POST /api/auth/activate-manager

   ===================================================== */



async function activateManagerAccount(req, res) {

  const { token, password } = req.body || {};



  if (!isValidManagerInviteToken(token)) {

    return res.status(400).json({

      message: "Invalid invitation link.",

    });

  }



  if (

    typeof password !== "string" ||

    password.length < 8 ||

    Buffer.byteLength(password, "utf8") > 72

  ) {

    return res.status(400).json({

      message:

        "Password must be at least 8 characters and no more than 72 UTF-8 bytes.",

    });

  }



  const tokenHash = hashManagerInviteToken(token);



  let client;

  let transactionOpen = false;



  try {

    // Hash the password before beginning the transaction

    // to avoid holding database locks during hashing.

    const passwordHash = await managerInviteBcrypt.hash(

      password,

      12

    );



    client = await managerInvitePool.connect();



    await client.query("BEGIN");

    transactionOpen = true;



    // Lock the invitation and associated user so the

    // invitation cannot be accepted twice concurrently.

    const invitationResult = await client.query(

      `

      SELECT

        mi.id AS invitation_id,

        mi.user_id,

        u.first_name,

        u.last_name,

        u.email

      FROM manager_invitations mi

      INNER JOIN users u

        ON u.id = mi.user_id

      WHERE mi.token_hash = $1

        AND mi.accepted_at IS NULL

        AND mi.expires_at > CURRENT_TIMESTAMP

        AND u.role = 'manager'

        AND u.is_active = FALSE

        AND u.email_verified = FALSE

        AND u.password_hash IS NULL

      FOR UPDATE OF mi, u

      `,

      [tokenHash]

    );



    if (invitationResult.rowCount === 0) {

      await client.query("ROLLBACK");

      transactionOpen = false;



      return res.status(400).json({

        message:

          "This invitation is invalid, expired, or already used.",

      });

    }



    const invitation = invitationResult.rows[0];



    // Activate the manager and save the hashed password.

    const updatedUser = await client.query(

      `

      UPDATE users

      SET

        password_hash = $1,

        is_active = TRUE,

        email_verified = TRUE,

        updated_at = CURRENT_TIMESTAMP

      WHERE id = $2

        AND role = 'manager'

        AND is_active = FALSE

        AND email_verified = FALSE

        AND password_hash IS NULL

      RETURNING

        id,

        first_name,

        last_name,

        email,

        role,

        is_active,

        email_verified

      `,

      [passwordHash, invitation.user_id]

    );



    if (updatedUser.rowCount !== 1) {

      throw new Error(

        "Manager account is no longer eligible for activation."

      );

    }



    // Mark the invitation as used.

    await client.query(

      `

      UPDATE manager_invitations

      SET accepted_at = CURRENT_TIMESTAMP

      WHERE id = $1

        AND accepted_at IS NULL

      `,

      [invitation.invitation_id]

    );



    await client.query("COMMIT");

    transactionOpen = false;



    const manager = updatedUser.rows[0];



    return res.status(200).json({

      message:

        "Manager account activated successfully. You can now log in.",

      manager: {

        id: manager.id,

        firstName: manager.first_name,

        lastName: manager.last_name,

        email: manager.email,

        role: manager.role,

        isActive: manager.is_active,

        emailVerified: manager.email_verified,

      },

    });

  } catch (error) {

    if (client && transactionOpen) {

      await client.query("ROLLBACK").catch(() => {});

    }



    console.error(

      "Manager account activation error:",

      error

    );



    return res.status(500).json({

      message: "Unable to activate manager account.",

    });

  } finally {

    if (client) {

      client.release();

    }

  }

}



// EXPORT CONTROLLERS

module.exports = {

  register,

  login,

  verifyOtp,

  resendOtp,

  getCurrentUser,

  updateProfile,

  requestPasswordReset,

  verifyPasswordReset,

  completePasswordReset,

  validateManagerInvitation,

  activateManagerAccount,

};
