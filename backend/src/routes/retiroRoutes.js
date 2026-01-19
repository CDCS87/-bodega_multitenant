const express = require('express');
const router = express.Router();

const retiroController = require('../controllers/retiroController');
const upload = require('../config/upload');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

// PYME crea retiro
router.post('/', authMiddleware, requireRole('PYME'), retiroController.createRetiro);

// Listado por rol
router.get('/', authMiddleware, retiroController.getRetiros);

// Scan (QR/código) antes de /:id
router.get('/scan/:codigo', authMiddleware, retiroController.scanRetiro);

// Detalle
router.get('/:id', authMiddleware, retiroController.getRetiroById);

// BODEGA confirma ingreso (FormData: items + fotos)
router.put(
  '/:id/ingresar',
  authMiddleware,
  requireRole('BODEGA'),
  upload.array('fotos', 10),
  retiroController.confirmarIngresoBodega
);

module.exports = router;



