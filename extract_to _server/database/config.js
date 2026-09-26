const mysql = require("mysql2");

const poolConfig = {
  connectionLimit: 25,
  host: process.env.DBHOST || "localhost",
  port: parseInt(process.env.DBPORT || "3306", 10),
  user: process.env.DBUSER,
  password: process.env.DBPASS,
  database: process.env.DBNAME,
  charset: "utf8mb4",
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
};

if (process.env.DB_SSL === "true" || process.env.DB_SSL === true) {
  poolConfig.ssl = {
    rejectUnauthorized: false,
  };
}

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
