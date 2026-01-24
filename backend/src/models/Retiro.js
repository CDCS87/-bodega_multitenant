const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Retiro = sequelize.define('Retiro', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo: {
    type: DataTypes.STRING(50)
  },
  pyme_id: {
    type: DataTypes.INTEGER
  },
  // Mapeamos 'direccion' del código a 'direccion_retiro' de la BD
  direccion: {
    type: DataTypes.TEXT,
    field: 'direccion_retiro' 
  },
  comuna: {
    type: DataTypes.STRING(100)
  },
  fecha_solicitada: {
    type: DataTypes.DATEONLY, // Usamos DATEONLY porque en la foto dice 'date'
    defaultValue: DataTypes.NOW
  },
  // Los campos de fecha que pueden ser nulos al inicio
  fecha_asignacion: { type: DataTypes.DATE },
  fecha_retiro: { type: DataTypes.DATE },
  fecha_ingreso_bodega: { type: DataTypes.DATE },
  
  transportista_id: { type: DataTypes.INTEGER },
  zona_id: { type: DataTypes.INTEGER },
  
  estado: {
    type: DataTypes.STRING(50),
    defaultValue: 'SOLICITADO'
  },
  observaciones: {
    type: DataTypes.TEXT
  },
  creado_por: {
    type: DataTypes.INTEGER
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'ordenes_retiro', // ¡El nombre correcto según tu imagen!
  timestamps: false            // Desactivamos los automáticos de Sequelize porque tu tabla ya tiene los suyos
});

module.exports = Retiro;

