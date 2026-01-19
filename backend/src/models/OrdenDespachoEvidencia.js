const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrdenDespachoEvidencia = sequelize.define('OrdenDespachoEvidencia', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orden_despacho_id: { type: DataTypes.INTEGER, allowNull: false },
  tipo: { type: DataTypes.STRING(30), allowNull: false },
  file_path: { type: DataTypes.TEXT, allowNull: false },
  creado_por: { type: DataTypes.INTEGER, allowNull: false },
  fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'ordenes_despacho_evidencias',
  timestamps: false
});

module.exports = OrdenDespachoEvidencia;

