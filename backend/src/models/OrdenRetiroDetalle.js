// src/models/OrdenRetiroDetalle.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrdenRetiroDetalle = sequelize.define('OrdenRetiroDetalle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // OJO: En tu SQL usabas 'retiro_id', pero en index.js pusiste 'orden_retiro_id'.
  // Debes asegurarte de cuál es el nombre real en tu base de datos.
  // Aquí pongo 'retiro_id' basándome en tu código SQL anterior.
  retiro_id: { 
    type: DataTypes.INTEGER,
    allowNull: false
    // Si en tu DB se llama 'orden_retiro_id', cambia este nombre aquí.
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
  tableName: 'ordenes_retiro_detalle', // Nombre real de la tabla en DB
  timestamps: false
});

module.exports = OrdenRetiroDetalle;

