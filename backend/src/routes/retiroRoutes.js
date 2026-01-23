const express = require('express');
const router = express.Router();
const retiroController = require('../controllers/retiroController');

// 👇 ¡IMPORTANTE! Las llaves { } son OBLIGATORIAS aquí
const { authMiddleware } = require('../middlewares/authMiddleware'); 

// Ruta para crear retiro (Línea 7 - Aquí es donde te está fallando ahora)
router.post('/crear', authMiddleware, retiroController.crearRetiro);

// Ruta para ver historial (Línea 10 - Esta fallará después si no actualizas el controlador)
router.get('/mis-retiros', authMiddleware, retiroController.getMyRetiros); 

// Rutas de bodega
router.get('/scan/:codigo', retiroController.getRetiroByCodigo);
router.post('/recepcionar', retiroController.procesarRecepcionQR);

module.exports = router;




