const mysql = require("mysql2");

let host = process.env.DBHOST || "gateway01.ap-northeast-1.prod.aws.tidbcloud.com";
let port = parseInt(process.env.DBPORT || "4000", 10);
let user = process.env.DBUSER || "3WY8tL2Hp26Mfr6.root";
let password = process.env.DBPASS || "egsFV2ynQl3lCW12";
let database = process.env.DBNAME || "whatscrm";
let ssl = process.env.DB_SSL === "true" || process.env.DB_SSL === true || !process.env.DBHOST;

// Auto-recovery: If the environment still points to dead Aiven cloud IP or default localhost, redirect to TiDB Cloud
if (!process.env.DBHOST || host === "104.248.88.174" || host.includes("aivencloud.com") || host === "localhost") {
  console.log("[DB] Using TiDB Cloud Serverless (Auto-Redirected from legacy host)...");
  host = "gateway01.ap-northeast-1.prod.aws.tidbcloud.com";
  port = 4000;
  user = "3WY8tL2Hp26Mfr6.root";
  password = "egsFV2ynQl3lCW12";
  database = "whatscrm";
  ssl = true;
}

const poolConfig = {
  connectionLimit: 25,
  host: host,
  port: port,
  user: user,
  password: password,
  database: database,
  charset: "utf8mb4",
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
};

if (ssl) {
  poolConfig.ssl = {
    rejectUnauthorized: false,
  };
}

console.log(`[DB] Initializing MySQL pool -> Host: ${host}:${port} | Database: ${database} | SSL: ${!!poolConfig.ssl}`);

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
    console.log({
      err: err,
      msg: "Database connected error",
    });
    return;
  } else {
    console.log("Database has been connected");
    connection.release();
  }
});

module.exports = con;
