const express = require('express');
const router = express.router();
const retiroController = require('../controllers/retiroController');
const authMiddleware = require('../middleware/auth'); // Tu middleware de seguridad

// Ruta para la Pyme (Crear)
router.post('/crear', authMiddleware, retiroController.createRetiro);

// Ruta para ver historial (Pyme)
// router.get('/mis-retiros', authMiddleware, retiroController.getMyRetiros); 

// --- RUTAS PARA LA BODEGA (APP DE OPERARIOS) ---
// 1. Escanear QR y ver checklist
router.get('/scan/:codigo', retiroController.getRetiroByCodigo);

// 2. Confirmar recepción y sumar stock
router.post('/recepcionar', retiroController.procesarRecepcionQR);

module.exports = router;




