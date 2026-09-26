require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function testDatabaseConnection() {
  try {
    console.log("Testing PostgreSQL connection...");

    const result = await pool.query("SELECT NOW()");

    console.log("PostgreSQL connected successfully.");
    console.log("Database time:", result.rows[0].now);
  } catch (error) {
    console.error("PostgreSQL connection failed.");
    console.error(error.message);
  } finally {
    await pool.end();
  }
}

testDatabaseConnection();