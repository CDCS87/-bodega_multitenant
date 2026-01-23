const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Retiro = sequelize.define('Retiro', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  codigo: { type: DataTypes.STRING, unique: true }, // El código del QR
  pyme_id: { type: DataTypes.INTEGER, allowNull: false },
  
  // Datos de Destino
  destinatario: { type: DataTypes.STRING },
  direccion: { type: DataTypes.STRING },
  comuna: { type: DataTypes.STRING },
  
  // Estado del flujo
  estado: { 
    type: DataTypes.ENUM('SOLICITADO', 'EN_RUTA', 'RECEPCIONADO'), 
    defaultValue: 'SOLICITADO' 
  },
  fecha_solicitud: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  fecha_recepcion: { type: DataTypes.DATE } // Cuándo llegó a bodega
}, { tableName: 'retiros' });

module.exports = Retiro;

