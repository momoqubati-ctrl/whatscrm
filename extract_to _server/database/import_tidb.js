const fs = require('fs');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function setupTiDB() {
  const conn = await mysql.createConnection({
    host: 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '3WY8tL2Hp26Mfr6.root',
    password: 'egsFV2ynQl3lCW12',
    multipleStatements: true,
    ssl: { rejectUnauthorized: false }
  });
  console.log('Connected to TiDB.');

  // Drop and recreate whatscrm database cleanly
  console.log('Resetting whatscrm database...');
  await conn.query('DROP DATABASE IF EXISTS whatscrm');
  await conn.query('CREATE DATABASE whatscrm');
  await conn.query('USE whatscrm');
  console.log('whatscrm database ready.');

  const sqlPath = 'D:/whatscrm-500/database/tidb_schema.sql';
  let content = fs.readFileSync(sqlPath, 'utf8');

  // Strip SQL single-line comments (-- ...)
  const lines = content.split(/\r?\n/);
  const cleanedLines = lines.filter(line => !line.trim().startsWith('--'));
  content = cleanedLines.join('\n');

  // Replace INSERT INTO with INSERT IGNORE INTO to safely re-run
  content = content.replace(/INSERT INTO/gi, 'INSERT IGNORE INTO');
  const statements = content.split(/;\s*[\r\n]+/).map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('/*'));
  console.log(`Executing ${statements.length} SQL statements...`);

  let executed = 0;
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await conn.query(stmt);
      executed++;
    } catch (e) {
      console.warn(`Statement ${i} warning/error:`, e.message);
    }
  }
  console.log(`Statements execution completed (${executed}/${statements.length} executed).`);

  // Add 5.9.8 columns to web_private if not exist
  const alterCols = [
    "ALTER TABLE web_private ADD COLUMN IF NOT EXISTS qr_storage varchar(50) DEFAULT 'mysql'",
    "ALTER TABLE web_private ADD COLUMN IF NOT EXISTS mongodb_string text DEFAULT NULL",
    "ALTER TABLE web_private ADD COLUMN IF NOT EXISTS embed_app_sec text DEFAULT NULL",
    "ALTER TABLE web_private ADD COLUMN IF NOT EXISTS embed_app_id text DEFAULT NULL",
    "ALTER TABLE web_private ADD COLUMN IF NOT EXISTS embed_app_config text DEFAULT NULL",
    "ALTER TABLE web_private ADD COLUMN IF NOT EXISTS teleAppId varchar(255) DEFAULT NULL",
    "ALTER TABLE web_private ADD COLUMN IF NOT EXISTS teleHash varchar(255) DEFAULT NULL",
    "ALTER TABLE web_private ADD COLUMN IF NOT EXISTS pay_mercadopago_public_key text DEFAULT NULL",
    "ALTER TABLE web_private ADD COLUMN IF NOT EXISTS pay_mercadopago_access_token text DEFAULT NULL",
    "ALTER TABLE web_private ADD COLUMN IF NOT EXISTS mercadopago_active int DEFAULT 1",
    "ALTER TABLE web_private ADD COLUMN IF NOT EXISTS fcm_apiKey text DEFAULT NULL",
    "ALTER TABLE web_private ADD COLUMN IF NOT EXISTS fcm_authDomain text DEFAULT NULL",
    "ALTER TABLE web_private ADD COLUMN IF NOT EXISTS fcm_projectId text DEFAULT NULL",
    "ALTER TABLE web_private ADD COLUMN IF NOT EXISTS fcm_storageBucket text DEFAULT NULL",
    "ALTER TABLE web_private ADD COLUMN IF NOT EXISTS fcm_messagingSenderId text DEFAULT NULL",
    "ALTER TABLE web_private ADD COLUMN IF NOT EXISTS fcm_appId text DEFAULT NULL",
    "ALTER TABLE web_private ADD COLUMN IF NOT EXISTS fcm_measurementId text DEFAULT NULL",
    "ALTER TABLE web_private ADD COLUMN IF NOT EXISTS fcm_vapidKey text DEFAULT NULL",
    "ALTER TABLE web_private ADD COLUMN IF NOT EXISTS fcm_clientEmail text DEFAULT NULL",
    "ALTER TABLE web_private ADD COLUMN IF NOT EXISTS fcm_privateKey text DEFAULT NULL",
    "ALTER TABLE web_private ADD COLUMN IF NOT EXISTS insta_app_id text DEFAULT NULL",
    "ALTER TABLE web_private ADD COLUMN IF NOT EXISTS insta_app_secret text DEFAULT NULL",
    "ALTER TABLE web_private ADD COLUMN IF NOT EXISTS insta_callback_url text DEFAULT NULL",
    "ALTER TABLE web_private ADD COLUMN IF NOT EXISTS messenger_app_secret text DEFAULT NULL",
    "ALTER TABLE web_private ADD COLUMN IF NOT EXISTS messenger_app_id text DEFAULT NULL",
    "ALTER TABLE admin ADD COLUMN IF NOT EXISTS tokenVersion INT DEFAULT 0",
    "ALTER TABLE user ADD COLUMN IF NOT EXISTS tokenVersion INT DEFAULT 0",
    "ALTER TABLE user ADD COLUMN IF NOT EXISTS fcm_data LONGTEXT DEFAULT NULL",
    "ALTER TABLE user ADD COLUMN IF NOT EXISTS fcm_inbox VARCHAR(50) DEFAULT NULL",
    "ALTER TABLE meta_api ADD COLUMN IF NOT EXISTS login_type varchar(50) DEFAULT 'manual'",
    "ALTER TABLE meta_api ADD COLUMN IF NOT EXISTS embed_data longtext DEFAULT NULL",
    "ALTER TABLE meta_api ADD COLUMN IF NOT EXISTS is_coexistence int DEFAULT 0",
    "ALTER TABLE meta_api ADD COLUMN IF NOT EXISTS platform_type varchar(50) DEFAULT NULL",
    "ALTER TABLE beta_chats ADD COLUMN IF NOT EXISTS updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
    "ALTER TABLE beta_chats ADD COLUMN IF NOT EXISTS kanban_order INT(11) DEFAULT 0"
  ];

  for (const alter of alterCols) {
    await conn.query(alter).catch(() => {});
  }
  console.log('Columns verified.');

  // Update web_public
  await conn.query(`UPDATE web_public SET 
    app_name = 'WhatsQubatiBot', 
    meta_description = 'WhatsQubatiBot is an all-in-one cloud-based platform for WhatsApp, Instagram, and Telegram marketing and automation.',
    chatbot_screen_tutorial = '',
    broadcast_screen_tutorial = '',
    home_page_tutorial = ''
    WHERE id = 1
  `).catch(() => {});

  // Update web_private
  await conn.query(`UPDATE web_private SET qr_storage = 'mysql' WHERE id = 1`).catch(() => {});

  const adminPassHash = await bcrypt.hash('Password@123', 10);

  // Admin in admin table
  await conn.query("INSERT INTO admin (email, password, uid, role, tokenVersion) VALUES ('admin@admin.com', ?, 'XhbfYkIAC1bYGhUodfJppmRCEUyGQJCZ', 'admin', 1) ON DUPLICATE KEY UPDATE password = ?, role = 'admin', tokenVersion = 1", [adminPassHash, adminPassHash]);

  const platinumPlan = JSON.stringify({
    id: 20,
    title: 'Platinum',
    short_description: 'This plan comes with the one-year validity and cover everything',
    allow_tag: 1,
    allow_note: 1,
    allow_chatbot: 1,
    contact_limit: '10000',
    allow_api: 1,
    is_trial: 0,
    price: 1899,
    price_strike: '699',
    plan_duration_in_days: 'Lifetime',
    createdAt: '2025-04-19T10:52:57.000Z',
    qr_account: 24,
    wa_warmer: 1,
    rest_api_qr: 1,
    instagram_inbox: 1,
    telegram_inbox: 1,
    allow_wa_forms: 1,
    messenger_inbox: 0
  });

  // Admin in user table
  await conn.query("INSERT INTO user (role, uid, name, email, password, timezone, plan, plan_expire, trial, tokenVersion) VALUES ('admin', 'XhbfYkIAC1bYGhUodfJppmRCEUyGQJCZ', 'Administrator', 'admin@admin.com', ?, 'Asia/Riyadh', ?, '4102444800000', 0, 0) ON DUPLICATE KEY UPDATE password = ?, plan = ?, plan_expire = '4102444800000'", [adminPassHash, platinumPlan, adminPassHash, platinumPlan]);

  // user@user.com
  await conn.query("INSERT INTO user (role, uid, name, email, password, timezone, plan, plan_expire, trial, tokenVersion) VALUES ('user', 'lWvj6K0xI0FlSKJoyV7ak9DN0mzvKJK8', 'Demo User', 'user@user.com', ?, 'Asia/Riyadh', ?, '4102444800000', 0, 0) ON DUPLICATE KEY UPDATE password = ?, plan = ?, plan_expire = '4102444800000'", [adminPassHash, platinumPlan, adminPassHash, platinumPlan]);

  // gnma@whatsqubatibot.com
  const gnmaPassHash = await bcrypt.hash('Qnma@573017X#', 10);
  await conn.query("INSERT INTO user (role, uid, name, email, password, timezone, plan, plan_expire, trial, tokenVersion) VALUES ('user', '5JxR0BbtypLgJEyOIH7hfNHPyERN2kqI', 'عبدالله قنما', 'gnma@whatsqubatibot.com', ?, 'Asia/Riyadh', ?, '4102444800000', 0, 0) ON DUPLICATE KEY UPDATE password = ?, name = 'عبدالله قنما', plan = ?, plan_expire = '4102444800000'", [gnmaPassHash, platinumPlan, gnmaPassHash, platinumPlan]);

  const [tables] = await conn.query('SHOW TABLES');
  console.log('Final table count in TiDB whatscrm:', tables.length);

  const [users] = await conn.query('SELECT id, email, name, role, plan_expire FROM user');
  console.log('Registered users in TiDB:', users);

  await conn.end();
  console.log('TiDB Cloud database configuration completed successfully!');
  process.exit(0);
}

setupTiDB().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
