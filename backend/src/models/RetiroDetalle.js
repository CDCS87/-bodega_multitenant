const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const RetiroDetalle = sequelize.define('RetiroDetalle', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  retiro_id: { type: DataTypes.INTEGER },
  producto_id: { type: DataTypes.INTEGER },
  cantidad: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'retiro_detalles', timestamps: false });

module.exports = RetiroDetalle;

