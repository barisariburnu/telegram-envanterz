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

/**
 * DB'den flag değerini okur.
 * Satır yoksa false döner.
 * @param {string} key
 * @returns {Promise<boolean>}
 */
async function getFlag(key) {
  const row = await queryOne(
    "SELECT value FROM feature_flags WHERE key = $1",
    [key]
  );
  return row ? row.value : false;
}

/**
 * holiday_mode flag'ini ve needs_sync güncellemesini tek transaction'da atomik yapar.
 * Not: value mevcut değer ile aynı olsa bile needs_sync yine tetiklenir.
 * @param {boolean} value
 */
async function toggleHolidayMode(value) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      "UPDATE feature_flags SET value = $1, updated_at = NOW() WHERE key = $2",
      [value, "holiday_mode"]
    );

    await client.query(
      `UPDATE products
       SET needs_sync = TRUE
       WHERE physical_stock > 0
         AND trendyol IS NOT NULL
         AND trendyol::text != 'null'`
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  query,
  queryOne,
  closePool,
  getFlag,
  toggleHolidayMode,
};
