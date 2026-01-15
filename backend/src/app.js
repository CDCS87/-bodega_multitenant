const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

sequelize.authenticate()
  .then(() => console.log('✅ Conexión a PostgreSQL establecida con éxito.'))
  .catch(err => console.error('❌ Error al conectar a la base de datos:', err));

app.get('/', (req, res) => res.send('API de Logística funcionando 🚀'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
