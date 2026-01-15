// backend/src/models/Product.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  pyme_id: { type: DataTypes.INTEGER, allowNull: false },

  sku: { type: DataTypes.STRING(100), allowNull: false },

  nombre: { type: DataTypes.STRING(255), allowNull: false },

  // SQL: descripcion TEXT
  descripcion: { type: DataTypes.TEXT, allowNull: true },

  codigo_barras: { type: DataTypes.STRING(100), allowNull: true },

  tiene_codigo_original: { type: DataTypes.BOOLEAN, defaultValue: false },

  // SQL: JSONB real
  caracteristicas_especificas: { type: DataTypes.JSONB, allowNull: true },

  cantidad_disponible: { type: DataTypes.INTEGER, defaultValue: 0 },
  cantidad_reservada: { type: DataTypes.INTEGER, defaultValue: 0 },

  unidad_medida: { type: DataTypes.STRING(50), defaultValue: 'unidad' },

  ubicacion_id: { type: DataTypes.INTEGER, allowNull: true },

  fecha_vencimiento: { type: DataTypes.DATEONLY, allowNull: true },

  lote: { type: DataTypes.STRING(50), allowNull: true },

  alerta_stock_bajo: { type: DataTypes.INTEGER, defaultValue: 10 },

  activo: { type: DataTypes.BOOLEAN, defaultValue: true },

  fecha_registro: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'productos',
  timestamps: false
});

module.exports = Product;

