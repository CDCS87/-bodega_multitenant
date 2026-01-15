const User = require('./User');
const RefreshToken = require('./RefreshToken');
const Product = require('./Product');

const models = {
  User,
  RefreshToken,
  Product
};

// Ejecutar asociaciones
Object.values(models).forEach(model => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

module.exports = models;
