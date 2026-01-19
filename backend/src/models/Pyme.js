// backend/src/models/Pyme.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pyme = sequelize.define('Pyme', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo_pyme: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  razon_social: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'pymes',
  timestamps: false
});

module.exports = Pyme;
