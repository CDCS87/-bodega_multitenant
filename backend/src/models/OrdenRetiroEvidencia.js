const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrdenRetiroEvidencia = sequelize.define('OrdenRetiroEvidencia', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orden_retiro_id: { type: DataTypes.INTEGER, allowNull: false },
  tipo: { type: DataTypes.STRING(20), allowNull: false }, // RETIRO | INGRESO
  file_path: { type: DataTypes.TEXT, allowNull: false },
  creado_por: { type: DataTypes.INTEGER, allowNull: true },
  fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'ordenes_retiro_evidencias',
  timestamps: false
});

module.exports = OrdenRetiroEvidencia;
