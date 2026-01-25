const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

// --- USUARIOS ---
router.post(
  '/usuarios',
  authMiddleware,
  requireRole('ADMINISTRADOR'),
  adminController.createUser
);

router.get(
  '/usuarios',
  authMiddleware,
  requireRole('ADMINISTRADOR'),
  adminController.listUsers
);

router.put(
  '/usuarios/:id',
  authMiddleware,
  requireRole('ADMINISTRADOR'),
  adminController.updateUser
);

router.delete(
  '/usuarios/:id',
  authMiddleware,
  requireRole('ADMINISTRADOR'),
  adminController.deleteUser
);

// --- ZONAS ---

router.get(
  '/zonas',  
  adminController.listZonas
);

module.exports = router;
