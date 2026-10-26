
const nodemailer = require("nodemailer");

let transporter;

// Configure the email service using environment variables.
function getTransporter() {
  const required = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "EMAIL_FROM",
  ];

  const missing = required.filter(
    (name) => !process.env[name]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing email configuration: ${missing.join(", ")}`
    );
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
}

// Send a verification code for registration, login, or reset.
async function sendOtpEmail({ email, code, purpose }) {
  const action =
    purpose === "register"
      ? "complete your signup"
      : purpose === "reset"
      ? "reset your password"
      : "complete your login";

  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Your PitchPilot AI verification code",

    text: `
Your PitchPilot AI code is ${code}.

It expires in 10 minutes.

Use it to ${action}.

If you did not request this code, you can ignore this email.
    `.trim(),

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 520px;
        margin: auto;
        color: #111827;
      ">
        <h2>PitchPilot AI verification</h2>

        <p>Use this code to ${action}:</p>

        <p style="
          font-size: 32px;
          font-weight: 700;
          letter-spacing: 8px;
          margin: 24px 0;
        ">
          ${code}
        </p>

        <p>This code expires in 10 minutes.</p>

        <p style="color: #64748b;">
          If you did not request this code,
          you can ignore this email.
        </p>
      </div>
    `,
  });
}

// Send a secure account activation invitation to a
// manager created by a platform administrator.
async function sendManagerInvitationEmail({
  email,
  firstName,
  invitationUrl,
  expiresInHours = 24,
}) {
  if (
    typeof invitationUrl !== "string" ||
    !/^https?:\/\/\S+$/.test(invitationUrl)
  ) {
    throw new Error("Invalid manager invitation URL.");
  }

  const safeFirstName =
    typeof firstName === "string" && firstName.trim()
      ? firstName.trim()
      : "there";

  const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };

      return entities[character];
    });

  const nameHtml = escapeHtml(safeFirstName);
  const urlHtml = escapeHtml(invitationUrl);

  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "You're invited to manage on PitchPilot AI",

    text: `
Hello ${safeFirstName},

A PitchPilot AI administrator has invited you to join
the platform as a Sales Manager.

To activate your manager account and create your
password, open the following link:

${invitationUrl}

This invitation expires in ${expiresInHours} hours.

Once your account is activated, you can sign in
using your email address and password.

For security, do not share this invitation link.

If you were not expecting this invitation,
please ignore this email.

PitchPilot AI Team
    `.trim(),

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 520px;
        margin: auto;
        padding: 24px;
        color: #111827;
      ">
        <h2 style="color: #312e81;">
          Welcome to PitchPilot AI
        </h2>

        <p>Hello ${nameHtml},</p>

        <p>
          A PitchPilot AI administrator has invited
          you to join the platform as a
          <strong>Sales Manager</strong>.
        </p>

        <p>
          Activate your account and create your
          password using the button below.
        </p>

        <div style="
          text-align: center;
          margin: 30px 0;
        ">
          <a
            href="${urlHtml}"
            style="
              display: inline-block;
              padding: 14px 24px;
              background-color: #4f46e5;
              color: #ffffff;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
            "
          >
            Activate Manager Account
          </a>
        </div>

        <p>
          This invitation expires in
          <strong>${expiresInHours} hours</strong>.
        </p>

        <p style="font-size: 13px; color: #64748b;">
          If the button does not work, copy and paste
          this link into your browser:
        </p>

        <p style="font-size: 12px; overflow-wrap: anywhere;">
          <a href="${urlHtml}">${urlHtml}</a>
        </p>

        <p style="font-size: 13px; color: #64748b;">
          Do not share this invitation link.
          If you did not expect this invitation,
          you can ignore this email.
        </p>

        <hr style="
          border: none;
          border-top: 1px solid #e5e7eb;
          margin-top: 28px;
        ">

        <p style="font-size: 12px; color: #94a3b8;">
          PitchPilot AI — Sales Training Platform
        </p>
      </div>
    `,
  });
}

module.exports = {
  sendOtpEmail,
  sendManagerInvitationEmail,
};
