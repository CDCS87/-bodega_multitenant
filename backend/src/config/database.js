const { Sequelize } = require('sequelize');

function required(name) {
  const v = process.env[name];
  if (!v || String(v).trim() === '') throw new Error(`Falta variable de entorno: ${name}`);
  return String(v);
}

const databaseUrl = process.env.DATABASE_URL;

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: process.env.DB_SSL === 'true'
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {}
    })
  : new Sequelize(
      required('DB_NAME'),
      required('DB_USER'),
      required('DB_PASSWORD'),
      {
        host: required('DB_HOST'),
        port: Number(process.env.DB_PORT || 5432),
        dialect: 'postgres',
        logging: false
      }
    );

module.exports = sequelize;


