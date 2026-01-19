const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrdenDespacho = sequelize.define('OrdenDespacho', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  codigo: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  pyme_id: { type: DataTypes.INTEGER, allowNull: false },

  destinatario_nombre: { type: DataTypes.STRING(255), allowNull: false },
  destinatario_telefono: { type: DataTypes.STRING(20) },
  destinatario_email: { type: DataTypes.STRING(255) },

  direccion_entrega: { type: DataTypes.TEXT, allowNull: false },
  comuna: { type: DataTypes.STRING(100), allowNull: false },
  zona_id: { type: DataTypes.INTEGER },

  estado: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'SOLICITADO' },

  fecha_solicitada: { type: DataTypes.DATE },
  fecha_picking: { type: DataTypes.DATE },
  fecha_preparado: { type: DataTypes.DATE },
  fecha_asignacion: { type: DataTypes.DATE },
  fecha_entrega: { type: DataTypes.DATE },

  transportista_id: { type: DataTypes.INTEGER },
  bodeguero_id: { type: DataTypes.INTEGER },

  promesa_entrega: { type: DataTypes.STRING(100) },
  observaciones: { type: DataTypes.TEXT },
  evidencia_foto: { type: DataTypes.TEXT },

  creado_por: { type: DataTypes.INTEGER, allowNull: false },
  qr_code: { type: DataTypes.TEXT }
}, {
  tableName: 'ordenes_despacho',
  timestamps: false
});

module.exports = OrdenDespacho;


