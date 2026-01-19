// backend/src/app.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const sequelize = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const retiroRoutes = require('./routes/retiroRoutes');
const despachoRoutes = require('./routes/despachoRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ servir evidencias
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/retiros', retiroRoutes);
app.use('/api/despachos', despachoRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = parseInt(process.env.PORT || '3000', 10);

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida con éxito.');

    app.listen(PORT, () => {
      console.log(`🚀 API corriendo en http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error('❌ Error de conexión a PostgreSQL:', e);
    process.exit(1);
  }
}

start();

module.exports = app;






