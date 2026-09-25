const { BufferJSON, initAuthCreds, proto } = require("baileys");
const { query } = require("../../../database/dbpromise");
const logger = require("../../../utils/logger");

/**
 * Native, resilient MySQL Auth State for Baileys
 * Compatible with modern MySQL (InnoDB, Aiven Cloud SSL, Connection Pools)
 */
const useMySQLAuthState = async (sessionId, tableName = "auth") => {
  const readData = async (id) => {
    try {
      const rows = await query(
        `SELECT value FROM ${tableName} WHERE id = ? AND session = ?`,
        [id, sessionId],
      );
      if (!rows || rows.length === 0 || !rows[0]?.value) {
        return null;
      }
      const val =
        typeof rows[0].value === "object"
          ? JSON.stringify(rows[0].value)
          : rows[0].value;
      return JSON.parse(val, BufferJSON.reviver);
    } catch (err) {
      logger.error(`[MySQL Auth] Error reading ${id}:`, err);
      return null;
    }
  };

  const writeData = async (id, value) => {
    try {
      const valueFixed =
        typeof value === "object"
          ? JSON.stringify(value, BufferJSON.replacer)
          : value;
      await query(
        `INSERT INTO ${tableName} (session, id, value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value = ?`,
        [sessionId, id, valueFixed, valueFixed],
      );
    } catch (err) {
      logger.error(`[MySQL Auth] Error writing ${id}:`, err);
    }
  };

  const removeData = async (id) => {
    try {
      await query(
        `DELETE FROM ${tableName} WHERE id = ? AND session = ?`,
        [id, sessionId],
      );
    } catch (err) {
      logger.error(`[MySQL Auth] Error removing ${id}:`, err);
    }
  };

  const removeAll = async () => {
    try {
      await query(`DELETE FROM ${tableName} WHERE session = ?`, [sessionId]);
    } catch (err) {
      logger.error(`[MySQL Auth] Error removing all for ${sessionId}:`, err);
    }
  };

  const creds = (await readData("creds")) || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data = {};
          for (const id of ids) {
            let value = await readData(`${type}-${id}`);
            if (type === "app-state-sync-key" && value) {
              value = proto.Message.AppStateSyncKeyData.fromObject(value);
            }
            data[id] = value;
          }
          return data;
        },
        set: async (data) => {
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const name = `${category}-${id}`;
              if (value) {
                await writeData(name, value);
              } else {
                await removeData(name);
              }
            }
          }
        },
      },
    },
    saveCreds: async () => {
      await writeData("creds", creds);
    },
    removeCreds: async () => {
      await removeAll();
    },
  };
};

module.exports = { useMySQLAuthState };
