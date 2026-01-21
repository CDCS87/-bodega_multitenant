const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrdenRetiroEvidencia = sequelize.define('OrdenRetiroEvidencia', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  retiro_id: { // Nombre exacto en la tabla DB
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // Asumo que tienes una columna para la URL o el archivo. 
  // Revisa en tu DB si se llama 'url', 'archivo', 'ruta', etc.
  url_archivo: { 
    type: DataTypes.STRING,
    allowNull: true
  },
  comentario: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'ordenes_retiro_evidencias', // Asegúrate que este sea el nombre real de la tabla
  timestamps: false // Cambia a true si tienes createdAt/updatedAt
});

module.exports = OrdenRetiroEvidencia;
