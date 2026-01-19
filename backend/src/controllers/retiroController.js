const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

exports.createRetiro = async (req, res) => {
  const pymeId = req.user.pyme_id;
  const { direccion_retiro, comuna, fecha_solicitada, observaciones, items } = req.body;

  if (!direccion_retiro || !comuna || !fecha_solicitada || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Datos incompletos' });
  }

  try {
    const orden = await sequelize.transaction(async (t) => {
      const [o] = await sequelize.query(
        `INSERT INTO ordenes_retiro (pyme_id, direccion_retiro, comuna, fecha_solicitada, observaciones, estado)
         VALUES (:pyme_id, :dir, :comuna, :fecha, :obs, 'SOLICITADO')
         RETURNING *`,
        {
          replacements: {
            pyme_id: pymeId,
            dir: direccion_retiro,
            comuna,
            fecha: fecha_solicitada,
            obs: observaciones || null
          },
          type: QueryTypes.INSERT,
          transaction: t
        }
      );

      for (const it of items) {
        await sequelize.query(
          `INSERT INTO ordenes_retiro_detalle (orden_retiro_id, producto_id, cantidad_esperada, observaciones)
           VALUES (:oid, :pid, :qty, :obs)`,
          {
            replacements: {
              oid: o[0].id,
              pid: it.producto_id,
              qty: it.cantidad_esperada,
              obs: it.observaciones || null
            },
            transaction: t
          }
        );
      }

      return o[0];
    });

    return res.json({ orden });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: e.message || 'Error creando retiro' });
  }
};

exports.getRetiros = async (req, res) => {
  const role = req.user.role;

  let where = '';
  let repl = {};

  if (role === 'PYME') {
    where = 'WHERE r.pyme_id = :pyme_id';
    repl.pyme_id = req.user.pyme_id;
  }

  // BODEGA ve pendientes (SOLICITADO/RETIRADO etc), ADMIN ve todo, TRANSPORTISTA lo verá por su endpoint /api/transporte
  const rows = await sequelize.query(
    `SELECT r.*
     FROM ordenes_retiro r
     ${where}
     ORDER BY r.id DESC
     LIMIT 200`,
    { replacements: repl, type: QueryTypes.SELECT }
  );

  res.json({ ordenes: rows });
};

exports.getRetiroById = async (req, res) => {
  const id = Number(req.params.id);

  const orden = await sequelize.query(
    `SELECT * FROM ordenes_retiro WHERE id = :id`,
    { replacements: { id }, type: QueryTypes.SELECT }
  );
  if (!orden.length) return res.status(404).json({ message: 'No existe' });

  const detalle = await sequelize.query(
    `SELECT d.*, p.nombre AS nombre_producto
     FROM ordenes_retiro_detalle d
     JOIN productos p ON p.id = d.producto_id
     WHERE d.orden_retiro_id = :id
     ORDER BY d.id`,
    { replacements: { id }, type: QueryTypes.SELECT }
  );

  res.json({ orden: { ...orden[0], detalle } });
};

exports.scanRetiro = async (req, res) => {
  const codigo = String(req.params.codigo || '').trim();
  if (!codigo) return res.status(400).json({ message: 'Código inválido' });

  // MVP: asume que ordenes_retiro tiene campo codigo_qr/codigo
  const rows = await sequelize.query(
    `SELECT * FROM ordenes_retiro WHERE codigo = :c OR codigo_qr = :c LIMIT 1`,
    { replacements: { c: codigo }, type: QueryTypes.SELECT }
  );

  if (!rows.length) return res.status(404).json({ message: 'No encontrado' });
  res.json({ orden: rows[0] });
};

exports.confirmarIngresoBodega = async (req, res) => {
  const ordenId = Number(req.params.id);
  let items;
  try { items = JSON.parse(req.body.items || '[]'); } catch { items = []; }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Items inválidos' });
  }

  try {
    await sequelize.transaction(async (t) => {
      const orden = await sequelize.query(
        `SELECT id, pyme_id, estado
         FROM ordenes_retiro
         WHERE id = :id
         FOR UPDATE`,
        { replacements: { id: ordenId }, type: QueryTypes.SELECT, transaction: t }
      );
      if (!orden.length) throw new Error('Orden no existe');
      if (orden[0].estado === 'INGRESADO_BODEGA') throw new Error('Ya ingresado');

      // actualizar cantidades recibidas
      for (const it of items) {
        await sequelize.query(
          `UPDATE ordenes_retiro_detalle
           SET cantidad_recibida = :qty
           WHERE id = :did AND orden_retiro_id = :oid`,
          { replacements: { qty: it.cantidad_recibida, did: it.detalle_id, oid: ordenId }, transaction: t }
        );
      }

      // upsert inventario por pyme + producto (simple)
      await sequelize.query(
        `INSERT INTO inventario_bodega (pyme_id, producto_id, ubicacion_id, atributos, cantidad_disponible, cantidad_reservada)
         SELECT r.pyme_id,
                d.producto_id,
                d.ubicacion_id,
                COALESCE(d.atributos, '{}'::jsonb),
                d.cantidad_recibida,
                0
         FROM ordenes_retiro_detalle d
         JOIN ordenes_retiro r ON r.id = d.orden_retiro_id
         WHERE d.orden_retiro_id = :oid
           AND d.cantidad_recibida > 0
         ON CONFLICT (pyme_id, producto_id, ubicacion_key, atributos_key)
         DO UPDATE SET
           cantidad_disponible = inventario_bodega.cantidad_disponible + EXCLUDED.cantidad_disponible,
           updated_at = NOW()`,
        { replacements: { oid: ordenId }, transaction: t }
      );

      await sequelize.query(
        `UPDATE ordenes_retiro
         SET estado = 'INGRESADO_BODEGA',
             fecha_ingreso_bodega = NOW()
         WHERE id = :id`,
        { replacements: { id: ordenId }, transaction: t }
      );
    });

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: e.message || 'Error ingreso bodega' });
  }
};



