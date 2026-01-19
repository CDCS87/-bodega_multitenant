const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

// RETIROS asignados al transportista (MVP)
exports.getMisRetiros = async (req, res) => {
  const tid = req.user.id;

  const rows = await sequelize.query(
    `SELECT id, direccion_retiro, comuna, estado
     FROM ordenes_retiro
     WHERE transportista_id = :tid
       AND estado IN ('SOLICITADO','ASIGNADO','EN_RUTA')
     ORDER BY id DESC`,
    { replacements: { tid }, type: QueryTypes.SELECT }
  );

  res.json({ retiros: rows });
};

// marcar retirado (cambia estado a RETIRADO)
exports.marcarRetirado = async (req, res) => {
  const id = Number(req.params.id);
  const tid = req.user.id;

  await sequelize.query(
    `UPDATE ordenes_retiro
     SET estado = 'RETIRADO',
         fecha_retiro = NOW()
     WHERE id = :id AND transportista_id = :tid`,
    { replacements: { id, tid } }
  );

  res.json({ ok: true });
};

// DESPACHOS asignados al transportista (MVP)
exports.getMisDespachos = async (req, res) => {
  const tid = req.user.id;

  const rows = await sequelize.query(
    `SELECT id, direccion_entrega, comuna, estado
     FROM ordenes_despacho
     WHERE transportista_id = :tid
       AND estado IN ('PREPARADO','EN_RUTA')
     ORDER BY id DESC`,
    { replacements: { tid }, type: QueryTypes.SELECT }
  );

  res.json({ despachos: rows });
};

exports.marcarEnRuta = async (req, res) => {
  const id = Number(req.params.id);
  const tid = req.user.id;

  await sequelize.query(
    `UPDATE ordenes_despacho
     SET estado = 'EN_RUTA'
     WHERE id = :id AND transportista_id = :tid AND estado = 'PREPARADO'`,
    { replacements: { id, tid } }
  );

  res.json({ ok: true });
};

exports.marcarEntregado = async (req, res) => {
  const id = Number(req.params.id);
  const tid = req.user.id;
  const obs = req.body?.observacion || null;

  await sequelize.query(
    `UPDATE ordenes_despacho
     SET estado = 'ENTREGADO',
         fecha_entrega = NOW(),
         observacion_entrega = :obs
     WHERE id = :id AND transportista_id = :tid AND estado = 'EN_RUTA'`,
    { replacements: { id, tid, obs } }
  );

  res.json({ ok: true });
};
