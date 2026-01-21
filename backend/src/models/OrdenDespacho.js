const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrdenDespacho = sequelize.define('OrdenDespacho', {
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
  tableName: 'ordenes_despacho',
  timestamps: false
});

module.exports = OrdenDespacho;


