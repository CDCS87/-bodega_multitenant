const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Asegúrate de que este sea tu archivo de conexión a Sequelize

// Sequelize
const Zona = sequelize.define('Zona', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  comunas: {
    type: DataTypes.ARRAY(DataTypes.STRING), // Para manejar el campo ANY(comunas) de tu SQL
    allowNull: true
  }
}, {
  // CONFIGURACIÓN BASE DE DATOS
  tableName: 'zonas_geograficas', 
  timestamps: false,               
  freezeTableName: true
});

// MÉTODOS PERSONALIZADOS
Zona.findByComuna = async function(comuna) {
  try {
    
    const { Op } = require('sequelize');
    return await Zona.findOne({
      where: {
        activo: true,
        comunas: {
          [Op.contains]: [comuna] 
        }
      }
    });
  } catch (error) {
    console.error('Error en findByComuna:', error);
    return null;
  }
};
const originalFindAll = Zona.findAll;
Zona.listAllActive = async function() {
  return await Zona.findAll({
    attributes: ['id', 'nombre'], // Solo trae lo que necesitas
    where: { activo: true },
    order: [['nombre', 'ASC']]
  });
};

module.exports = Zona;

