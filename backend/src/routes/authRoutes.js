const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * 🔐 RUTAS DE AUTENTICACIÓN
 * Estas rutas NO requieren autenticación previa
 */

// POST /api/auth/register - Registro de usuarios
router.post('/register', authController.register);

// POST /api/auth/login - Login con access token + refresh token
router.post('/login', authController.login);

// POST /api/auth/refresh - Renovar access token con refresh token
router.post('/refresh', authController.refreshToken);

// POST /api/auth/logout - Cerrar sesión y revocar refresh token
router.post('/logout', authController.logout);

// POST /api/auth/request-password-reset - Solicitar recuperación de contraseña
router.post('/request-password-reset', authController.requestPasswordReset);

// POST /api/auth/reset-password - Resetear contraseña con token
router.post('/reset-password', authController.resetPassword);

module.exports = router;
