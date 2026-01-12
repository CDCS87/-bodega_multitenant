const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  email: { 
    type: DataTypes.STRING, 
    unique: true, 
    allowNull: false,
    validate: { isEmail: true } // Validación extra de seguridad
  },
  password_hash: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  nombre_completo: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  telefono: { 
    type: DataTypes.STRING(20), 
    allowNull: true 
  },
  rol: { 
    type: DataTypes.ENUM('ADMINISTRADOR', 'PYME', 'BODEGA', 'TRANSPORTISTA'), //ENUM + SEQUELIZE para evitar inyeccion SQL
    allowNull: false 
  },
  activo: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
  },
  fecha_creacion: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  },
  pyme_id: { 
    type: DataTypes.INTEGER, 
    allowNull: true,
    references: {
      model: 'pymes', // Nombre de la tabla en MER
      key: 'id'
    }
  }
}, {
  tableName: 'usuarios', 
  timestamps: false      
});

module.exports = User;