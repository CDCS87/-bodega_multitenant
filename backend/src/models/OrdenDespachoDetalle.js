const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrdenDespachoDetalle = sequelize.define('OrdenDespachoDetalle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  despacho_id: { // Nombre de la columna en la DB (Probablemente no sea orden_despacho_id)
    type: DataTypes.INTEGER,
    allowNull: false
  },
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'ordenes_despacho_detalle',
  timestamps: false
});

module.exports = OrdenDespachoDetalle;

