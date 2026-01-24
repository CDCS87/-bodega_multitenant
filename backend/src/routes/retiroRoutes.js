const express = require('express');
const router = express.Router();
const retiroController = require('../controllers/retiroController');
const { authMiddleware } = require('../middlewares/authMiddleware'); // O donde tengas tu middleware

// Validamos que el usuario esté logueado (sea Pyme, Admin o Bodega)
router.use(authMiddleware);

// ==========================================
// RUTAS PARA LA PYME
// ==========================================
// POST /api/retiros/crear -> Aquí se genera el código y el QR
router.post('/crear', retiroController.crearRetiro);

// GET /api/retiros/mis-retiros -> Historial
router.get('/mis-retiros', retiroController.getMyRetiros);


// ==========================================
// RUTAS PARA LA BODEGA
// ==========================================
// POST /api/retiros/ingreso-bodega -> Escaneo del QR
router.post('/ingreso-bodega', retiroController.ingresarEnBodega);

router.get('/pendientes', authMiddleware, retiroController.getPendientes);

module.exports = router;




