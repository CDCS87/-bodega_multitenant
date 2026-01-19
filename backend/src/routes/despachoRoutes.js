const express = require('express');
const router = express.Router();

const despachoController = require('../controllers/despachoController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

// ✅ SOLO lo que existe en el controller (evita crash)
router.post(
  '/:id/finalizar-picking',
  authMiddleware,
  requireRole('BODEGA'),
  despachoController.finalizarPicking
);

module.exports = router;






