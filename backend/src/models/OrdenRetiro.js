const db = require('../config/database');

async function insertOrdenRetiro({
  pymeId,
  codigo,
  comuna,
  direccion,
  rango,
  estado,
  transportistaId
}) {

  const q = `
    INSERT INTO ordenes_retiro
      (pyme_id, codigo, comuna, direccion, rango_horario, estado, transportista_id)
    VALUES
      ($1,$2,$3,$4,$5,$6,$7)
    RETURNING *;
  `;
  const { rows } = await db.query(q, [
    pymeId, codigo, comuna, direccion, rango, estado, transportistaId
  ]);
  return rows[0];
}

async function insertOrdenRetiroDetalle({ retiroId, items }) {
  // items: [{ producto_id, cantidad, ... }]
  if (!items?.length) return [];

  const values = [];
  const params = [];
  let i = 1;

  for (const it of items) {
    // Ajusta columnas según ordenes_retiro_detalle
    params.push(`($${i++}, $${i++}, $${i++})`);
    values.push(retiroId, it.producto_id, it.cantidad);
  }

  const q = `
    INSERT INTO ordenes_retiro_detalle
      (retiro_id, producto_id, cantidad)
    VALUES ${params.join(',')}
    RETURNING *;
  `;
  const { rows } = await db.query(q, values);
  return rows;
}

async function findByCodigo(codigo, scope) {
  // PYME: filtra por pyme_id (evita fuga)
  if (scope?.mode === 'PYME') {
    const q = `
      SELECT *
      FROM ordenes_retiro
      WHERE codigo = $1 AND pyme_id = $2
      LIMIT 1;
    `;
    const { rows } = await db.query(q, [codigo, scope.pyme_id]);
    return rows[0] || null;
  }

  // BODEGA: no tiene pyme_id en user, el pyme sale desde la orden
  const q = `
    SELECT *
    FROM ordenes_retiro
    WHERE codigo = $1
    LIMIT 1;
  `;
  const { rows } = await db.query(q, [codigo]);
  return rows[0] || null;
}

async function findDetalleByRetiroId(retiroId) {
  const q = `SELECT * FROM ordenes_retiro_detalle WHERE retiro_id = $1;`;
  const { rows } = await db.query(q, [retiroId]);
  return rows;
}

module.exports = {
  insertOrdenRetiro,
  insertOrdenRetiroDetalle,
  findByCodigo,
  findDetalleByRetiroId
};

