
const crypto = require("crypto");
const pool = require("../config/database");
const generateToken = require("../utils/generateToken");
const { getGoogleConfig } = require("../services/googleOAuthService");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const hash = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");

const randomToken = () =>
  crypto.randomBytes(32).toString("base64url");

const cookieOptions = {
  httpOnly: true,
  signed: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/oauth/exchange",
  maxAge: 2 * 60 * 1000,
};

const formatUser = (user) => ({
  id: user.id,
  firstName: user.first_name,
  lastName: user.last_name,
  email: user.email,
  role: user.role,
});

async function startGoogle(req, res) {
  try {
    const oidc = await import("openid-client");
    const config = await getGoogleConfig();

    const state = oidc.randomState();
    const nonce = oidc.randomNonce();
    const verifier = oidc.randomPKCECodeVerifier();
    const challenge =
      await oidc.calculatePKCECodeChallenge(verifier);

    await pool.query(
      `INSERT INTO oauth_flows
       (id, provider, purpose, state_hash,
        nonce, code_verifier, expires_at)
       VALUES ($1, 'google', 'login', $2, $3, $4,
               NOW() + INTERVAL '10 minutes')`,
      [crypto.randomUUID(), hash(state), nonce, verifier]
    );

    const url = oidc.buildAuthorizationUrl(config, {
      redirect_uri: REDIRECT_URI,
      scope: "openid email profile",
      state,
      nonce,
      code_challenge: challenge,
      code_challenge_method: "S256",
    });

    return res.redirect(url.href);
  } catch (error) {
    console.error("Google OAuth start failed:", error);
    return res.status(500).json({
      message: "Unable to start Google sign-in.",
    });
  }
}

async function googleCallback(req, res) {
  const state = req.query.state;

  if (typeof state !== "string" || !state) {
    return res.redirect(`${CLIENT_URL}/login?oauth_error=invalid_state`);
  }

  const client = await pool.connect();

  try {
    // Consume the flow once, even if authentication later fails.
    const flowResult = await client.query(
      `UPDATE oauth_flows
       SET consumed_at = NOW()
       WHERE state_hash = $1
         AND provider = 'google'
         AND purpose = 'login'
         AND consumed_at IS NULL
         AND expires_at > NOW()
       RETURNING nonce, code_verifier`,
      [hash(state)]
    );

    if (flowResult.rowCount !== 1) {
      return res.redirect(
        `${CLIENT_URL}/login?oauth_error=invalid_state`
      );
    }

    const flow = flowResult.rows[0];
    const oidc = await import("openid-client");
    const config = await getGoogleConfig();

    const callbackUrl = new URL(REDIRECT_URI);

    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === "string") {
        callbackUrl.searchParams.set(key, value);
      }
    }

    const tokens = await oidc.authorizationCodeGrant(
      config,
      callbackUrl,
      {
        pkceCodeVerifier: flow.code_verifier,
        expectedState: state,
        expectedNonce: flow.nonce,
        idTokenExpected: true,
      }
    );

    const claims = tokens.claims();

    if (!claims?.sub || claims.email_verified !== true) {
      return res.redirect(
        `${CLIENT_URL}/login?oauth_error=unverified_identity`
      );
    }

    const email = String(claims.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return res.redirect(
        `${CLIENT_URL}/login?oauth_error=missing_email`
      );
    }

    await client.query("BEGIN");

    const existingIdentity = await client.query(
      `SELECT u.*
       FROM oauth_accounts oa
       JOIN users u ON u.id = oa.user_id
       WHERE oa.provider = 'google'
         AND oa.provider_user_id = $1
       FOR UPDATE OF u`,
      [claims.sub]
    );

    let user;

    if (existingIdentity.rowCount > 0) {
      user = existingIdentity.rows[0];
    } else {
      // Do not automatically link an existing password account.
      const emailMatch = await client.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );

      if (emailMatch.rowCount > 0) {
        await client.query("ROLLBACK");
        return res.redirect(
          `${CLIENT_URL}/login?oauth_error=existing_account`
        );
      }

      const firstName = String(claims.given_name || "Google");
      const lastName = String(claims.family_name || "User");

      const created = await client.query(
        `INSERT INTO users
         (first_name, last_name, email, password_hash, role, email_verified)
         VALUES ($1, $2, $3, NULL, 'agent', TRUE)
         RETURNING *`,
        [firstName, lastName, email]
      );

      user = created.rows[0];

      await client.query(
        `INSERT INTO oauth_accounts
         (user_id, provider, provider_user_id, provider_email)
         VALUES ($1, 'google', $2, $3)`,
        [user.id, claims.sub, email]
      );
    }

    if (!user.is_active) {
      await client.query("ROLLBACK");
      return res.redirect(
        `${CLIENT_URL}/login?oauth_error=inactive_account`
      );
    }

    const ticket = randomToken();

    await client.query(
      `INSERT INTO oauth_login_tickets
       (id, ticket_hash, user_id, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '2 minutes')`,
      [crypto.randomUUID(), hash(ticket), user.id]
    );

    await client.query("COMMIT");

    res.cookie("oauth_ticket", ticket, cookieOptions);

    return res.redirect(`${CLIENT_URL}/auth/callback`);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Google OAuth callback failed:", error);

    return res.redirect(
      `${CLIENT_URL}/login?oauth_error=authentication_failed`
    );
  } finally {
    client.release();
  }
}

async function exchangeTicket(req, res) {
  const ticket = req.signedCookies?.oauth_ticket;

  if (!ticket || typeof ticket !== "string") {
    return res.status(401).json({
      message: "Missing or invalid login ticket.",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `UPDATE oauth_login_tickets
       SET consumed_at = NOW()
       WHERE ticket_hash = $1
         AND consumed_at IS NULL
         AND expires_at > NOW()
       RETURNING user_id`,
      [hash(ticket)]
    );

    if (result.rowCount !== 1) {
      await client.query("ROLLBACK");
      return res.status(401).json({
        message: "Login ticket expired or already used.",
      });
    }

    const users = await client.query(
      "SELECT * FROM users WHERE id = $1 AND is_active = TRUE",
      [result.rows[0].user_id]
    );

    if (users.rowCount !== 1) {
      await client.query("ROLLBACK");
      return res.status(403).json({
        message: "Account is unavailable.",
      });
    }

    await client.query("COMMIT");

    const user = users.rows[0];

    res.clearCookie("oauth_ticket", {
      path: cookieOptions.path,
      sameSite: cookieOptions.sameSite,
      secure: cookieOptions.secure,
    });

    return res.json({
      token: generateToken(user),
      user: formatUser(user),
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("OAuth ticket exchange failed:", error);

    return res.status(500).json({
      message: "Unable to complete sign-in.",
    });
  } finally {
    client.release();
  }
}

module.exports = {
  startGoogle,
  googleCallback,
  exchangeTicket,
};
