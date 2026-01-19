const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');
const crypto = require('crypto');

function genQrCode() {
  return `QR-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
}

exports.ingresar = async (req, res) => {
  const ordenId = Number(req.params.id);

  if (!Number.isInteger(ordenId) || ordenId <= 0) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  // items llega como JSON string (FormData)
  let items;
  try {
    items = JSON.parse(req.body.items || '[]');
  } catch {
    return res.status(400).json({ message: 'Items inválidos (JSON)' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Debes enviar items' });
  }

  for (const it of items) {
    if (!Number.isInteger(it.detalle_id) || it.detalle_id <= 0) {
      return res.status(400).json({ message: 'detalle_id inválido' });
    }
    if (!Number.isInteger(it.cantidad_recibida) || it.cantidad_recibida < 0) {
      return res.status(400).json({ message: 'cantidad_recibida inválida' });
    }
  }

  try {
    await sequelize.transaction(async (t) => {

      // 1️⃣ Lock de la orden (evita doble ingreso)
      const orden = await sequelize.query(
        `SELECT id, pyme_id, estado
         FROM ordenes_retiro
         WHERE id = :id
         FOR UPDATE`,
        {
          replacements: { id: ordenId },
          type: QueryTypes.SELECT,
          transaction: t
        }
      );

      if (!orden.length) {
        throw new Error('Orden no existe');
      }

      if (orden[0].estado === 'INGRESADO_BODEGA') {
        throw new Error('Esta orden ya fue ingresada a bodega');
      }

      // 2️⃣ Actualizar cantidades recibidas
      for (const it of items) {
        const [result] = await sequelize.query(
          `UPDATE ordenes_retiro_detalle
           SET cantidad_recibida = :qty
           WHERE id = :detalleId
             AND orden_retiro_id = :ordenId`,
          {
            replacements: {
              qty: it.cantidad_recibida,
              detalleId: it.detalle_id,
              ordenId
            },
            transaction: t
          }
        );

        // rowCount no viene directo, validamos con select si quieres
      }

      // 3️⃣ Seguridad: recepción NO crea productos
      // Solo actualiza cantidades recibidas de items existentes

      // 4️⃣ Cambiar estado a INGRESADO_BODEGA
      await sequelize.query(
        `UPDATE ordenes_retiro
         SET estado = 'INGRESADO_BODEGA', 
             qr_code = :qrCode,
             fecha_ingreso = NOW()
         WHERE id = :id`,
        {
          replacements: {
            id: ordenId,
            qrCode: genQrCode()
          },
          transaction: t
        }
      );
    });

    return res.status(200).json({
      message: 'Orden ingresada exitosamente',
      orden_id: ordenId
    });
  } catch (error) {
    console.error('Error en ingresar:', error.message);
    return res.status(400).json({ message: error.message });
  }
};


