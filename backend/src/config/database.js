const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración de la conexión usando tus variables del .env
const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false, // Para que la consola esté limpia
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
  }
);

// Prueba de conexión inmediata
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida con éxito.');
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
  }
};

testConnection();

module.exports = sequelize;