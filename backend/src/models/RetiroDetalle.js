const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./Product'); // Importamos para relacionar
const Retiro = require('./Retiro');

const RetiroDetalle = sequelize.define('RetiroDetalle', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  retiro_id: { type: DataTypes.INTEGER },
  producto_id: { type: DataTypes.INTEGER },
  cantidad: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'retiro_detalles', timestamps: false });

// Definimos relaciones
Retiro.hasMany(RetiroDetalle, { foreignKey: 'retiro_id', as: 'detalles' });
RetiroDetalle.belongsTo(Retiro, { foreignKey: 'retiro_id' });
RetiroDetalle.belongsTo(Product, { foreignKey: 'producto_id', as: 'producto' });

module.exports = RetiroDetalle;

