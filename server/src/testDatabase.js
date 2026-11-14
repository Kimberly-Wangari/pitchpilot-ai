const pool = require("./config/database");

async function testDatabaseConnection() {
  try {
    console.log("Testing PostgreSQL connection...");

    const result = await pool.query("SELECT NOW()");

    console.log("PostgreSQL connected successfully.");
    console.log("Database time:", result.rows[0].now);
  } catch (error) {
    console.error("PostgreSQL connection failed.");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

testDatabaseConnection();
