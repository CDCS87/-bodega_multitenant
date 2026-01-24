require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); 

// 1. Base de datos
const sequelize = require('./config/database');

// 2. Modelos (Activa las relaciones)
require('./models'); 

// 👇 IMPORTANTE: Traemos los modelos específicos para sincronizarlos manualmente
const Retiro = require('./models/Retiro');
const RetiroDetalle = require('./models/RetiroDetalle');

// 3. Rutas
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const retiroRoutes = require('./routes/retiroRoutes');
const despachoRoutes = require('./routes/despachoRoutes');
const transporteRoutes = require('./routes/transporteRoutes');
const adminRoutes = require('./routes/adminRoutes');
const pymeRoutes = require('./routes/pymeRoutes');

const app = express();

// --- MIDDLEWARES ---
app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ARCHIVOS ESTÁTICOS (EVIDENCIAS) ---
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
    console.log('📂 Carpeta uploads creada automáticamente.');
}
app.use('/uploads', express.static(uploadsDir));

// --- RUTAS API ---
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/retiros', retiroRoutes);
app.use('/api/pyme', pymeRoutes);

// Rutas futuras
// app.use('/api/despachos', despachoRoutes);
// app.use('/api/transporte', transporteRoutes);

// Health Check
app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// --- MANEJO DE ERRORES GLOBAL ---
app.use((err, req, res, next) => {
  console.error('🔥 Error no manejado:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Error interno del servidor',
    error: err.message 
  });
});

const PORT = parseInt(process.env.PORT || '3000', 10);

async function start() {
  try {
    // 1. Probar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a Base de Datos establecida.');

    // 🔴 COMENTAMOS LA SINCRONIZACIÓN GLOBAL
    // Esto causaba el error con la vista "mv_inventario_pyme"
    // await sequelize.sync({ alter: true }); 

    // 🟢 SINCRONIZACIÓN QUIRÚRGICA
    // Solo actualizamos las tablas de Retiro que modificamos hoy.
    // Al hacerlo así, Sequelize no intenta tocar la tabla 'productos' y evitamos el error.
    console.log('🔄 Sincronizando tablas de Retiro...');
    
    // Aseguramos que la tabla ordenes_retiro tenga las columnas nuevas
    await Retiro.sync({ alter: true });
    
    // Aseguramos que la tabla de detalles exista
    await RetiroDetalle.sync({ alter: true });
    
    console.log('✅ Modelos de Retiro sincronizados (Schema actualizado).');

    // 3. Iniciar Servidor
    app.listen(PORT, () => {
      console.log(`🚀 API corriendo en puerto ${PORT}`);
      console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (e) {
    console.error('❌ Error fatal al iniciar el servidor:', e);
    process.exit(1);
  }
}

start();

module.exports = app;






