import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on("connect", () => {
  try {
    console.log("Connected to the database");
  } catch (err) {
    console.error("Error connecting to the database", err);
  }
});
export default pool;
