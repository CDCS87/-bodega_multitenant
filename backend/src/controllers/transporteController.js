// controllers/transporteController.js
const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

exports.getMisDespachos = async (req, res) => {
  const transportistaId = req.user.id;

  const rows = await sequelize.query(
    `SELECT id, direccion_entrega, comuna, estado
     FROM ordenes_despacho
     WHERE transportista_id = :tid
       AND estado IN ('PREPARADO', 'EN_RUTA')
     ORDER BY id DESC`,
    {
      replacements: { tid: transportistaId },
      type: QueryTypes.SELECT
    }
  );

  res.json({ despachos: rows });
};
