const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrdenDespachoDetalle = sequelize.define('OrdenDespachoDetalle', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orden_despacho_id: { type: DataTypes.INTEGER, allowNull: false },
  producto_id: { type: DataTypes.INTEGER, allowNull: false },

  nombre_producto: { type: DataTypes.STRING(255), allowNull: false },
  sku: { type: DataTypes.STRING(100), allowNull: false },

  cantidad_solicitada: { type: DataTypes.INTEGER, allowNull: false },
  cantidad_preparada: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  cantidad_entregada: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

  observaciones: { type: DataTypes.TEXT }
}, {
  tableName: 'ordenes_despacho_detalle',
  timestamps: false
});

module.exports = OrdenDespachoDetalle;

