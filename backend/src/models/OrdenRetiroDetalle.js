const db = require('../config/database');

async function listByRetiroId(retiroId) {
  const q = `SELECT * FROM ordenes_retiro_detalle WHERE orden_retiro_id = $1 ORDER BY id ASC;`;
  const { rows } = await db.query(q, [retiroId]);
  return rows;
}

async function insertMany(orden_retiro_id, items) {
  if (!items?.length) return [];

  const values = [];
  const placeholders = [];
  let i = 1;

  for (const it of items) {
    placeholders.push(
      `($${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++})`
    );

    values.push(
      orden_retiro_id,
      it.nombre_producto ?? null,
      it.descripcion ?? null,
      it.cantidad_esperada ?? 0,
      it.tiene_codigo_barras ?? false,
      it.codigo_barras ?? null,
      it.sku_generado ?? null,
      it.producto_id ?? null
    );
  }

  const q = `
    INSERT INTO ordenes_retiro_detalle
      (orden_retiro_id, nombre_producto, descripcion, cantidad_esperada,
       tiene_codigo_barras, codigo_barras, sku_generado, producto_id)
    VALUES ${placeholders.join(',')}
    RETURNING *;
  `;

  const { rows } = await db.query(q, values);
  return rows;
}

module.exports = { insertMany, listByRetiroId };

