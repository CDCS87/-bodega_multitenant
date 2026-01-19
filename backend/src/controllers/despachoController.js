const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

// PYME crea despacho (solicitud)
exports.createDespacho = async (req, res) => {
  const pymeId = req.user.pyme_id;
  const { direccion_entrega, comuna, observaciones, items } = req.body;

  if (!direccion_entrega || !comuna || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Datos incompletos' });
  }

  try {
    const orden = await sequelize.transaction(async (t) => {
      const [o] = await sequelize.query(
        `INSERT INTO ordenes_despacho (pyme_id, direccion_entrega, comuna, observaciones, estado)
         VALUES (:pyme_id, :dir, :comuna, :obs, 'SOLICITADO')
         RETURNING *`,
        {
          replacements: { pyme_id: pymeId, dir: direccion_entrega, comuna, obs: observaciones || null },
          type: QueryTypes.INSERT,
          transaction: t
        }
      );

      for (const it of items) {
        await sequelize.query(
          `INSERT INTO ordenes_despacho_detalle (orden_despacho_id, producto_id, cantidad)
           VALUES (:oid, :pid, :qty)`,
          { replacements: { oid: o[0].id, pid: it.producto_id, qty: it.cantidad }, transaction: t }
        );
      }

      return o[0];
    });

    res.json({ orden });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message || 'Error creando despacho' });
  }
};

// listado por rol
exports.getDespachos = async (req, res) => {
  const role = req.user.role;
  const repl = {};
  let where = '';

  if (role === 'PYME') {
    where = 'WHERE d.pyme_id = :pyme_id';
    repl.pyme_id = req.user.pyme_id;
  }

  const rows = await sequelize.query(
    `SELECT d.*
     FROM ordenes_despacho d
     ${where}
     ORDER BY d.id DESC
     LIMIT 200`,
    { replacements: repl, type: QueryTypes.SELECT }
  );

  res.json({ despachos: rows });
};

// TU lógica: descuenta inventario al finalizar picking (BODEGA)
exports.finalizarPicking = async (req, res) => {
  const despachoId = Number(req.params.id);
  if (!Number.isInteger(despachoId)) return res.status(400).json({ message: 'ID inválido' });

  try {
    await sequelize.transaction(async (t) => {
      const orden = await sequelize.query(
        `SELECT id, pyme_id, estado
         FROM ordenes_despacho
         WHERE id = :id
         FOR UPDATE`,
        { replacements: { id: despachoId }, type: QueryTypes.SELECT, transaction: t }
      );
      if (!orden.length) throw new Error('Orden no existe');
      if (orden[0].estado === 'PICKING_FINALIZADO') throw new Error('Picking ya finalizado');

      const pymeId = orden[0].pyme_id;

      const items = await sequelize.query(
        `SELECT producto_id, COALESCE(cantidad_pickeada, cantidad) AS qty
         FROM ordenes_despacho_detalle
         WHERE orden_despacho_id = :id`,
        { replacements: { id: despachoId }, type: QueryTypes.SELECT, transaction: t }
      );

      for (const it of items) {
        if (!it.producto_id || Number(it.qty) <= 0) continue;

        await sequelize.query(
          `UPDATE inventario_bodega
           SET cantidad_disponible = cantidad_disponible - :qty,
               updated_at = NOW()
           WHERE pyme_id = :pymeId
             AND producto_id = :productoId`,
          {
            replacements: { qty: it.qty, pymeId, productoId: it.producto_id },
            transaction: t
          }
        );
      }

      await sequelize.query(
        `UPDATE ordenes_despacho
         SET estado = 'PICKING_FINALIZADO',
             fecha_picking = NOW()
         WHERE id = :id`,
        { replacements: { id: despachoId }, transaction: t }
      );
    });

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: e.message || 'Error al finalizar picking' });
  }
};





