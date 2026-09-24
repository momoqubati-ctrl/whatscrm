require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

async function initDatabase() {
  const dbConfig = {
    host: process.env.DBHOST || "localhost",
    port: process.env.DBPORT || 3306,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DBNAME,
    multipleStatements: true,
  };

  if (process.env.DB_SSL === "true" || process.env.DB_SSL === true) {
    dbConfig.ssl = { rejectUnauthorized: false };
  }

  try {
    console.log("Checking database connection and tables...");
    const connection = await mysql.createConnection(dbConfig);
    console.log("Connected to MySQL server successfully.");

    // Check if admin table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'admin'");
    if (tables.length > 0) {
      console.log("Database tables already exist. Skipping schema import.");
      await connection.end();
      return;
    }

    console.log("Database tables not found. Importing import.sql...");
    const sqlPath = path.resolve(__dirname, "../../database/import.sql");
    if (!fs.existsSync(sqlPath)) {
      console.error("import.sql file not found at:", sqlPath);
      await connection.end();
      return;
    }

    const sqlContent = fs.readFileSync(sqlPath, "utf8");
    await connection.query(sqlContent);
    console.log("Database schema and initial data imported successfully!");
    await connection.end();
  } catch (err) {
    console.error("Error during database initialization:", err.message);
  }
}

if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };
