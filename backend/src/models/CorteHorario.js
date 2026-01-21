const db = require('../config/database');

async function listCortes() {
  const q = `SELECT * FROM cortes_horarios ORDER BY id;`;
  const { rows } = await db.query(q);
  return rows;
}

module.exports = { listCortes };
