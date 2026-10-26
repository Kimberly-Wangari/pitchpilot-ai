const fs = require("fs");
const path = require("path");
const pool = require("../src/config/database");

async function migrate() {
  const sql = fs.readFileSync(
    path.resolve(__dirname, "../sql/otp_auth.sql"),
    "utf8"
  );

  await pool.query(sql);
  console.log("OTP authentication migration completed.");
}

migrate()
  .catch((error) => {
    console.error("OTP authentication migration failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
