const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transportista = sequelize.define('Transportista', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  rut: { type: DataTypes.STRING(12), allowNull: false },
  patenteVehiculo: { 
    type: DataTypes.STRING(10), 
    field: 'patente_vehiculo', // Mapeo exacto
    allowNull: false 
  },
  capacidadCarga: { 
    type: DataTypes.DECIMAL(8, 2), 
    field: 'capacidad_carga', 
    allowNull: true 
  },
  turno: { type: DataTypes.STRING(20), allowNull: true },
  zonaAsignadaId: { type: DataTypes.INTEGER, field: 'zona_asignada_id', allowNull: true },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'transportistas',
  timestamps: false
});

module.exports = Transportista;
