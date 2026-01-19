// backend/src/models/index.js
const User = require('./User');
const RefreshToken = require('./RefreshToken');
const Product = require('./Product');
const Pyme = require('./Pyme');

const OrdenRetiro = require('./OrdenRetiro');
const OrdenRetiroDetalle = require('./OrdenRetiroDetalle');
const OrdenRetiroEvidencia = require('./OrdenRetiroEvidencia');

const OrdenDespacho = require('./OrdenDespacho');
const OrdenDespachoDetalle = require('./OrdenDespachoDetalle');
const OrdenDespachoEvidencia = require('./OrdenDespachoEvidencia');

const models = {
  User,
  RefreshToken,
  Product,
  Pyme,

  OrdenRetiro,
  OrdenRetiroDetalle,
  OrdenRetiroEvidencia,

  OrdenDespacho,
  OrdenDespachoDetalle,
  OrdenDespachoEvidencia
};

// Ejecutar asociaciones declaradas dentro de cada modelo (si existieran)
Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

/* =========================
   Asociaciones RETIROS
========================= */
OrdenRetiro.hasMany(OrdenRetiroDetalle, {
  foreignKey: 'orden_retiro_id',
  as: 'detalle'
});
OrdenRetiroDetalle.belongsTo(OrdenRetiro, {
  foreignKey: 'orden_retiro_id',
  as: 'orden'
});
OrdenRetiroDetalle.belongsTo(Product, {
  foreignKey: 'producto_id',
  as: 'producto'
});
OrdenRetiro.hasMany(OrdenRetiroEvidencia, {
  foreignKey: 'orden_retiro_id',
  as: 'evidencias'
});
OrdenRetiroEvidencia.belongsTo(OrdenRetiro, {
  foreignKey: 'orden_retiro_id',
  as: 'orden'
});

/* =========================
   Asociaciones DESPACHOS
========================= */
OrdenDespacho.hasMany(OrdenDespachoDetalle, {
  foreignKey: 'orden_despacho_id',
  as: 'detalle'
});
OrdenDespachoDetalle.belongsTo(OrdenDespacho, {
  foreignKey: 'orden_despacho_id',
  as: 'orden'
});
OrdenDespachoDetalle.belongsTo(Product, {
  foreignKey: 'producto_id',
  as: 'producto'
});
OrdenDespacho.hasMany(OrdenDespachoEvidencia, {
  foreignKey: 'orden_despacho_id',
  as: 'evidencias'
});
OrdenDespachoEvidencia.belongsTo(OrdenDespacho, {
  foreignKey: 'orden_despacho_id',
  as: 'orden'
});

module.exports = models;



