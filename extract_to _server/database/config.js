const mysql = require("mysql2");

const dbHost = process.env.DBHOST || process.env.DB_HOST || "localhost";
const defaultPort = dbHost.includes("tidbcloud.com") ? 4000 : 3306;
const dbPort = parseInt(process.env.DBPORT || process.env.DB_PORT || defaultPort, 10);
const dbUser = process.env.DBUSER || process.env.DB_USER;
const dbPass = process.env.DBPASS || process.env.DB_PASS || process.env.DB_PASSWORD;
const dbName = process.env.DBNAME || process.env.DB_NAME;

const poolConfig = {
  connectionLimit: 25,
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPass,
  database: dbName,
  charset: "utf8mb4",
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 20000,
};

if (
  process.env.DB_SSL === "true" ||
  process.env.DB_SSL === true ||
  process.env.DBSSL === "true" ||
  dbHost.includes("tidbcloud.com")
) {
  poolConfig.ssl = {
    rejectUnauthorized: false,
  };
}

console.log(`[DB] Initializing pool -> Host: ${poolConfig.host}:${poolConfig.port}, User: ${poolConfig.user}, DB: ${poolConfig.database}, SSL: ${Boolean(poolConfig.ssl)}`);

const con = mysql.createPool(poolConfig);

// Handle connection errors
con.on("connection", function (connection) {
  // console.log("Database connection established as id " + connection.threadId);
});

con.on("error", function (err) {
  console.error("Database error:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.log("Database connection lost, reconnecting...");
  }
});

con.getConnection((err, connection) => {
  if (err) {
    console.error("[DB] Database connection error:", {
      code: err.code,
      errno: err.errno,
      syscall: err.syscall,
      address: err.address,
      port: err.port,
      message: err.message,
    });
    return;
  } else {
    console.log("[DB] Database has been connected successfully to " + poolConfig.host);
    connection.release();
  }
});

module.exports = con;
