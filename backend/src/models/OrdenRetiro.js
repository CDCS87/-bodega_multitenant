// src/models/OrdenRetiro.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 
const OrdenRetiro = sequelize.define('OrdenRetiro', {
  
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  pyme_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  codigo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  comuna: {
    type: DataTypes.STRING,
    allowNull: true
  },
  direccion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  rango_horario: {
    type: DataTypes.STRING,
    allowNull: true
  },
  estado: {
    type: DataTypes.STRING,
    defaultValue: 'PENDIENTE' 
  },
  transportista_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'ordenes_retiro', // El nombre real de tu tabla en la DB
  timestamps: false // Pon true si tu tabla tiene createdAt y updatedAt
});

module.exports = OrdenRetiro;

