const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

// Crear usuario (solo admin)
router.post(
  '/usuarios',
  authMiddleware,
  requireRole('ADMINISTRADOR'),
  adminController.createUser
);

// Listar usuarios (solo admin)
router.get(
  '/usuarios',
  authMiddleware,
  requireRole('ADMINISTRADOR'),
  adminController.listUsers
);

module.exports = router;
