const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');

// 1. IMPORTAR RUTAS (Las crearemos a continuación)
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); 

// 2. CONECTAR RUTAS A LA API
// Esto hace que las rutas funcionen como http://localhost:3000/api/auth/...
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Probar conexión a la base de datos
sequelize.authenticate()
    .then(() => console.log('✅ Conexión a PostgreSQL establecida con éxito.'))
    .catch(err => console.error('❌ Error al conectar a la base de datos:', err));

// Ruta de prueba
app.get('/', (req, res) => res.send('API de Logística funcionando 🚀'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});