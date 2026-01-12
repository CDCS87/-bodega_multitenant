const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 
const Product = sequelize.define('Product', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  pyme_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false
  },
  sku: { 
    type: DataTypes.STRING(100), 
    allowNull: false 
  },
  nombre: { 
    type: DataTypes.STRING(255), 
    allowNull: false 
  },
  descripcion: { 
    type: DataTypes.TEXT 
  },
  codigo_barras: { 
    type: DataTypes.STRING(100) 
  },
  tiene_codigo_original: { 
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  caracteristicas_especificas: { 
    type: DataTypes.JSONB 
  },
  cantidad_disponible: { 
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  cantidad_reservada: { 
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  unidad_medida: {
    type: DataTypes.STRING(50)
  },
  ubicacion_id: { 
    type: DataTypes.INTEGER 
  },
  fecha_vencimiento: { 
    type: DataTypes.DATEONLY 
  },
  lote: { 
    type: DataTypes.STRING(50) 
  },
  alerta_stock_bajo: { 
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  activo: { 
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  fecha_registro: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'productos',
  timestamps: false   // 🔥 CLAVE
});

module.exports = Product;
