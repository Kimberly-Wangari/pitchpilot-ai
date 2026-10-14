
let cachedConfig;

async function getGoogleConfig() {
  if (!cachedConfig) {
    const oidc = await import("openid-client");

    cachedConfig = await oidc.discovery(
      new URL("https://accounts.google.com"),
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
  }

  return cachedConfig;
}

module.exports = { getGoogleConfig };
