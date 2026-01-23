const express = require('express');
const router = express.Router();
const retiroController = require('../controllers/retiroController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Ruta para la Pyme (Crear)
router.post('/crear', authMiddleware, retiroController.crearRetiro);

// Ruta para ver historial (Pyme)
router.get('/mis-retiros', authMiddleware, retiroController.getMyRetiros); 

// --- RUTAS PARA LA BODEGA (APP DE BODEGA) ---
// 1. Escanear QR y ver checklist
router.get('/scan/:codigo', retiroController.getRetiroByCodigo);

// 2. Confirmar recepción y sumar stock
router.post('/recepcionar', retiroController.procesarRecepcionQR);

module.exports = router;




