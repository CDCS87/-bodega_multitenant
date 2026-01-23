require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// 1. Traemos la conexión (como ya tenías)
const sequelize = require('./config/database');

// 2. ¡NUEVO! Importamos los modelos para que se activen las relaciones (hasMany, belongsTo)
// Al hacer require('./models'), Node ejecuta automáticamente src/models/index.js
require('./models'); 

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const retiroRoutes = require('./routes/retiroRoutes');
const despachoRoutes = require('./routes/despachoRoutes');
const transporteRoutes = require('./routes/transporteRoutes');
const adminRoutes = require('./routes/adminRoutes');
const pymeRoutes = require('./routes/pymeRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ servir evidencias
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/retiros', retiroRoutes);
app.use('/api/pyme', pymeRoutes);
//app.use('/api/despachos', despachoRoutes);
//app.use('/api/transporte', transporteRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = parseInt(process.env.PORT || '3000', 10);

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida con éxito.');

    // Opcional: Esto crea las tablas si no existen. 
    // Como usas un archivo SQL manual, mejor déjalo comentado o úsalo con cuidado.
    // await sequelize.sync(); 

    app.listen(PORT, () => {
      console.log(`API corriendo en puerto ${PORT}`);
    });
  } catch (e) {
    console.error('Error de conexión a PostgreSQL:', e);
    process.exit(1);
  }
}

start();

module.exports = app;






