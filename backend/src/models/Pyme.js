// backend/src/models/Pyme.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pyme = sequelize.define('Pyme', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigoPyme: {
    type: DataTypes.STRING(50),
    field: 'codigo_pyme',
    allowNull: false
  },
  nombrePyme: {
    type: DataTypes.STRING(255),
    field: 'razon_social',
    allowNull: true
  },
  direccionPyme: {
    type: DataTypes.STRING(255),
    field: 'direccion',
    allowNull: true
  },
  rut: {
    type: DataTypes.STRING(20),
    allowNull: false // La DB no permite nulos
  },
  comuna: {
    type: DataTypes.STRING(50),
    field: 'comuna',
    allowNull: true
  },
  contactoNombre: {
    type: DataTypes.STRING(255),
    field: 'contacto_nombre',
    allowNull: false // Según tu error, este es obligatorio
  },
  contactoTelefono: {
    type: DataTypes.STRING(50),
    field: 'contacto_telefono',
    allowNull: true
  },
  contactoEmail: {
    type: DataTypes.STRING(255),
    field: 'contacto_email', // Nombre exacto en tu DB
    allowNull: false
  },
  contactoTelefono: {
  type: DataTypes.STRING(50),
  field: 'contacto_telefono', // Debe coincidir con el nombre en tu DB
  allowNull: false
},
volumenContratado: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'volumen_contratado',
    allowNull: false,
    defaultValue: 0.00
  }
}, {
  tableName: 'pymes',
  timestamps: false
});

module.exports = Pyme;
