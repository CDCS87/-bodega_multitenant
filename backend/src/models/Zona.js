const db = require('../config/database');

async function findByComuna(comuna) {
  const q = `
    SELECT *
    FROM zonas_geograficas
    WHERE activo = true
      AND $1 = ANY(comunas)
    LIMIT 1;
  `;
  const { rows } = await db.query(q, [comuna]);
  return rows[0] || null;
}

module.exports = { findByComuna };

