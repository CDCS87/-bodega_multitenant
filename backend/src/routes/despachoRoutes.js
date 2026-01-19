// backend/src/routes/despachoRoutes.js
const express = require('express');
const router = express.Router();

const despachoController = require('../controllers/despachoController');
const upload = require('../config/upload');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

// ✅ Crear despacho (PYME/ADMIN)
router.post(
  '/',
  authMiddleware,
  requireRole('PYME', 'ADMINISTRADOR'),
  despachoController.createDespacho
);

// ✅ Listar despachos (según rol)
router.get(
  '/',
  authMiddleware,
  despachoController.getDespachos
);

// ✅ Scan por QR/código (IMPORTANTE antes de /:id)
router.get(
  '/scan/:codigo',
  authMiddleware,
  despachoController.scanByCodigo
);

// ✅ Detalle por ID
router.get(
  '/:id',
  authMiddleware,
  despachoController.getDespachoById
);

// =======================
// BODEGA (PICKING)
// =======================
router.put(
  '/:id/picking',
  authMiddleware,
  requireRole('BODEGA'),
  despachoController.iniciarPicking
);

router.put(
  '/:id/preparar',
  authMiddleware,
  requireRole('BODEGA'),
  despachoController.confirmarPreparado
);

// =======================
// TRANSPORTISTA
// =======================

// Retirar desde bodega (con evidencia opcional)
router.put(
  '/:id/retirar',
  authMiddleware,
  requireRole('TRANSPORTISTA'),
  upload.array('fotos', 5),
  despachoController.confirmarRetiroBodega
);

// Entregar (con evidencia)
router.put(
  '/:id/entregar',
  authMiddleware,
  requireRole('TRANSPORTISTA'),
  upload.array('fotos', 5),
  despachoController.confirmarEntrega
);

module.exports = router;




