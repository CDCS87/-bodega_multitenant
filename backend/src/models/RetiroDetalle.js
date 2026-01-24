const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RetiroDetalle = sequelize.define('RetiroDetalle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // 👇 CORRECCIÓN: Se llama 'orden_retiro_id' en tu BD
  orden_retiro_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: true // Puede ser null si borras el producto después, pero guardamos el histórico
  },
  // 👇 CORRECCIÓN: Se llama 'cantidad_esperada'
  cantidad_esperada: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // Campos opcionales que aparecen en tu tabla (puedes llenarlos si quieres)
  nombre_producto: { type: DataTypes.STRING },
  sku_generado: { type: DataTypes.STRING },
  observaciones: { type: DataTypes.TEXT },
  
  // Estos se llenan cuando bodega recibe, por ahora inician vacíos o por defecto
  cantidad_recibida: { type: DataTypes.INTEGER, defaultValue: 0 }

}, {
  tableName: 'ordenes_retiro_detalle', // Nombre exacto de la tabla
  timestamps: false // Tu tabla no muestra createdAt/updatedAt en la imagen
});

module.exports = RetiroDetalle;

