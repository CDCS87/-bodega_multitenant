// backend/src/models/Pyme.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pyme = sequelize.define('Pyme', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigoPyme: {
    type: DataTypes.STRING(50),
    field: 'codigo_pyme',
    allowNull: false
  },
  nombrePyme: {
    type: DataTypes.STRING(255),
    field: 'razon_social',
    allowNull: true
  },
  direccionPyme: {
    type: DataTypes.STRING(255),
    field: 'direccion',
    allowNull: true
  },
}, {
  tableName: 'pymes',
  timestamps: false
});

module.exports = Pyme;
