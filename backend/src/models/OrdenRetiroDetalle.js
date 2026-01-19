const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrdenRetiroDetalle = sequelize.define('OrdenRetiroDetalle', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  orden_retiro_id: { type: DataTypes.INTEGER, allowNull: false },

  nombre_producto: { type: DataTypes.STRING(255), allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: true },

  cantidad_esperada: { type: DataTypes.INTEGER, allowNull: false },
  cantidad_recibida: { type: DataTypes.INTEGER, defaultValue: 0 },

  tiene_codigo_barras: { type: DataTypes.BOOLEAN, defaultValue: false },
  codigo_barras: { type: DataTypes.STRING(100), allowNull: true },

  sku_generado: { type: DataTypes.STRING(100), allowNull: true },

  producto_id: { type: DataTypes.INTEGER, allowNull: true },

  observaciones: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: 'ordenes_retiro_detalle',
  timestamps: false
});

module.exports = OrdenRetiroDetalle;
