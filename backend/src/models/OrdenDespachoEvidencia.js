const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrdenDespachoEvidencia = sequelize.define('OrdenDespachoEvidencia', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  despacho_id: { // Nombre exacto en la tabla DB
    type: DataTypes.INTEGER,
    allowNull: false
  },
  url_archivo: { // Revisa si tu columna se llama así
    type: DataTypes.STRING,
    allowNull: true
  },
  comentario: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'ordenes_despacho_evidencias',
  timestamps: false
});

module.exports = OrdenDespachoEvidencia;

