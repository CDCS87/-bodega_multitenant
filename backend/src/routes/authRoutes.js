const express = require('express');
const router = express.Router();

// 👇 ESTA ES LA LÍNEA QUE FALTABA
const authController = require('../controllers/authController');

// Middleware de autenticación (ya corregido)
const { authMiddleware: auth } = require('../middlewares/authMiddleware');

/**
 * 🔐 RUTAS DE AUTENTICACIÓN
 * Estas rutas NO requieren autenticación previa (generalmente)
 */

// POST /api/auth/register - Registro de usuarios
router.post('/register', authController.register);

// POST /api/auth/login - Login con access token + refresh token
router.post('/login', authController.login);

// POST /api/auth/refresh - Renovar access token con refresh token
router.post('/refresh', authController.refreshToken);

// POST /api/auth/logout - Cerrar sesión y revocar refresh token
// Nota: Si quieres proteger logout, agrega 'auth' antes: router.post('/logout', auth, authController.logout);
router.post('/logout', authController.logout);

// POST /api/auth/request-password-reset - Solicitar recuperación de contraseña
router.post('/request-password-reset', authController.requestPasswordReset);

// POST /api/auth/reset-password - Resetear contraseña con token
router.post('/reset-password', authController.resetPassword);

module.exports = router;
