const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

exports.finalizarPicking = async (req, res) => {
  const despachoId = Number(req.params.id);

  if (!Number.isInteger(despachoId)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    await sequelize.transaction(async (t) => {

      // 1️⃣ Bloquear orden
      const orden = await sequelize.query(
        `SELECT id, pyme_id, estado
         FROM ordenes_despacho
         WHERE id = :id
         FOR UPDATE`,
        {
          replacements: { id: despachoId },
          type: QueryTypes.SELECT,
          transaction: t
        }
      );

      if (!orden.length) throw new Error('Orden no existe');
      if (orden[0].estado === 'PICKING_FINALIZADO') {
        throw new Error('Picking ya finalizado');
      }

      const pymeId = orden[0].pyme_id;

      // 2️⃣ Obtener productos y cantidades pickeadas
      const items = await sequelize.query(
        `SELECT producto_id,
                COALESCE(cantidad_pickeada, cantidad) AS qty
         FROM ordenes_despacho_detalle
         WHERE orden_despacho_id = :id`,
        {
          replacements: { id: despachoId },
          type: QueryTypes.SELECT,
          transaction: t
        }
      );

      // 3️⃣ Descontar inventario (simple)
      for (const it of items) {
        if (!it.producto_id || it.qty <= 0) continue;

        await sequelize.query(
          `UPDATE inventario_bodega
           SET cantidad_disponible = cantidad_disponible - :qty,
               updated_at = NOW()
           WHERE pyme_id = :pymeId
             AND producto_id = :productoId`,
          {
            replacements: {
              qty: it.qty,
              pymeId,
              productoId: it.producto_id
            },
            transaction: t
          }
        );
      }

      // 4️⃣ Marcar picking como finalizado
      await sequelize.query(
        `UPDATE ordenes_despacho
         SET estado = 'PICKING_FINALIZADO',
             fecha_picking = NOW()
         WHERE id = :id`,
        {
          replacements: { id: despachoId },
          transaction: t
        }
      );
    });

    return res.json({ ok: true });

  } catch (e) {
    console.error(e);
    return res.status(400).json({ message: e.message || 'Error al finalizar picking' });
  }
};




