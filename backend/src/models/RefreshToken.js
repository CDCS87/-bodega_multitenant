// backend/src/models/RefreshToken.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RefreshToken = sequelize.define('refresh_tokens', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  token_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Hash bcrypt del refresh token (nunca almacenado en texto plano)'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Fecha de expiración (7 días desde creación)'
  },
  revoked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Marcado como true cuando el token se revoca (logout o rotación)'
  },
  ip_address: {
    type: DataTypes.STRING(50),
    comment: 'IP desde donde se generó el token (auditoría de seguridad)'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'refresh_tokens',
  timestamps: false,
  indexes: [
    {
      name: 'idx_refresh_tokens_user',
      fields: ['user_id']
    },
    {
      name: 'idx_refresh_tokens_expires',
      fields: ['expires_at']
    }
  ]
});

// Relación con User
RefreshToken.associate = (models) => {
  RefreshToken.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'User'
  });
};

module.exports = RefreshToken;