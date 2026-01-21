const db = require('../config/database');

async function findDisponible(zonaId, turno) {
  const q = `
    SELECT *
    FROM transportistas
    WHERE activo = true
      AND zona_asignada_id = $1
      AND (turno = $2 OR turno = 'AMBOS')
    ORDER BY id ASC
    LIMIT 1;
  `;
  const { rows } = await db.query(q, [zonaId, turno]);
  return rows[0] || null;
}

module.exports = { findDisponible };
