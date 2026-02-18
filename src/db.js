/**
 * PostgreSQL database connection module
 * Uses node-postgres (pg) for database operations
 */

const { Pool } = require("pg");

// PostgreSQL connection configuration
const pool = new Pool({
  host: process.env.PG_HOST || "localhost",
  port: parseInt(process.env.PG_PORT) || 5432,
  database: process.env.PG_DATABASE || "dropsync",
  user: process.env.PG_USER || "postgres",
  password: process.env.PG_PASSWORD || "",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.on("connect", () => {
  console.log("PostgreSQL bağlantısı başarılı");
});

pool.on("error", (err) => {
  console.error("PostgreSQL bağlantı hatası:", err);
});

/**
 * Execute a query with parameters
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} - Query result
 */
async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log("Executed query", { text: text.substring(0, 50), duration, rows: result.rowCount });
  return result;
}

/**
 * Get a single row from query result
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object|null>} - Single row or null
 */
async function queryOne(text, params) {
  const result = await query(text, params);
  return result.rows[0] || null;
}

/**
 * Close the connection pool
 */
async function closePool() {
  await pool.end();
  console.log("PostgreSQL connection pool closed");
}

module.exports = {
  pool,
  query,
  queryOne,
  closePool,
};
