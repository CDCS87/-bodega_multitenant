// backend/src/models/index.js
const User = require('./User');
const RefreshToken = require('./RefreshToken');
const Product = require('./Product');
const Pyme = require('./Pyme');

const OrdenRetiro = require('./Retiro');
const OrdenRetiroDetalle = require('./RetiroDetalle');
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
// Relación con Detalle
OrdenRetiro.hasMany(OrdenRetiroDetalle, {
  foreignKey: 'retiro_id', // CORREGIDO: Coincide con tu DB
  as: 'detalle'
});
OrdenRetiroDetalle.belongsTo(OrdenRetiro, {
  foreignKey: 'retiro_id', // CORREGIDO
  as: 'orden'
});
OrdenRetiroDetalle.belongsTo(Product, {
  foreignKey: 'producto_id',
  as: 'producto'
});

// Relación con Evidencias
OrdenRetiro.hasMany(OrdenRetiroEvidencia, {
  foreignKey: 'retiro_id', // CORREGIDO
  as: 'evidencias'
});
OrdenRetiroEvidencia.belongsTo(OrdenRetiro, {
  foreignKey: 'retiro_id', // CORREGIDO
  as: 'orden'
});

/* =========================
   Asociaciones DESPACHOS
========================= */
// Relación con Detalle
OrdenDespacho.hasMany(OrdenDespachoDetalle, {
  foreignKey: 'despacho_id', // CORREGIDO: Coincide con tu DB
  as: 'detalle'
});
OrdenDespachoDetalle.belongsTo(OrdenDespacho, {
  foreignKey: 'despacho_id', // CORREGIDO
  as: 'orden'
});
OrdenDespachoDetalle.belongsTo(Product, {
  foreignKey: 'producto_id',
  as: 'producto'
});

// Relación con Evidencias
OrdenDespacho.hasMany(OrdenDespachoEvidencia, {
  foreignKey: 'despacho_id', // CORREGIDO
  as: 'evidencias'
});
OrdenDespachoEvidencia.belongsTo(OrdenDespacho, {
  foreignKey: 'despacho_id', // CORREGIDO
  as: 'orden'
});

module.exports = models;



