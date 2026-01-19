const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrdenRetiro = sequelize.define('OrdenRetiro', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  codigo: { type: DataTypes.STRING(50), allowNull: false, unique: true },

  pyme_id: { type: DataTypes.INTEGER, allowNull: false },

  direccion_retiro: { type: DataTypes.TEXT, allowNull: false },
  comuna: { type: DataTypes.STRING(100), allowNull: false },

  fecha_solicitada: { type: DataTypes.DATEONLY, allowNull: false },

  fecha_asignacion: { type: DataTypes.DATE, allowNull: true },
  fecha_retiro: { type: DataTypes.DATE, allowNull: true },
  fecha_ingreso_bodega: { type: DataTypes.DATE, allowNull: true },

  transportista_id: { type: DataTypes.INTEGER, allowNull: true },
  zona_id: { type: DataTypes.INTEGER, allowNull: true },

  estado: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'SOLICITADO' },

  observaciones: { type: DataTypes.TEXT, allowNull: true },

  // TEXT: "payload" para generar QR en frontend
  qr_code: { type: DataTypes.TEXT, allowNull: true },

  creado_por: { type: DataTypes.INTEGER, allowNull: true },
  fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'ordenes_retiro',
  timestamps: false
});

module.exports = OrdenRetiro;
