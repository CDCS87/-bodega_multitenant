const express = require('express');
const router = express.Router();
const transporteController = require('../controllers/transporteController');
const upload = require('../config/upload');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

router.use(authMiddleware, requireRole('TRANSPORTISTA'));

// RETIROS PYME
router.get('/retiros', transporteController.getMisRetiros);
router.post('/retiros/:id/retirado', upload.array('fotos', 5), transporteController.marcarRetirado);

// DESPACHOS CLIENTE
router.get('/despachos', transporteController.getMisDespachos);
router.post('/despachos/:id/en-ruta', transporteController.marcarEnRuta);
router.post('/despachos/:id/entregar', upload.array('fotos', 5), transporteController.marcarEntregado);

module.exports = router;
