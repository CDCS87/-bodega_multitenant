const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },

  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },

  nombre_completo: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },

  rol: {
    type: DataTypes.STRING(50),
    allowNull: false
  },

  pyme_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },

  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }

}, {
  tableName: 'usuarios',
  timestamps: false   
});

module.exports = User;


