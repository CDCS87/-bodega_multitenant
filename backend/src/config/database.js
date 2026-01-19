// backend/src/config/database.js
const { Sequelize } = require('sequelize');

function required(name) {
  const v = process.env[name];
  if (v === undefined || v === null || String(v).trim() === '') {
    throw new Error(`Falta variable de entorno: ${name}`);
  }
  return String(v);
}

const sequelize = new Sequelize(
  required('DB_NAME'),
  required('DB_USER'),
  required('DB_PASSWORD'), // ✅ siempre string y existe
  {
    host: required('DB_HOST'),
    port: Number(process.env.DB_PORT || 5432),
    dialect: 'postgres',
    logging: false
  }
);

module.exports = sequelize;

