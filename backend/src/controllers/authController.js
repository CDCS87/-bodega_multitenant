const { RefreshToken, User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { Op } = require('sequelize');

// ⚙️ Configuración según requerimientos del informe
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_ACCESS_EXPIRES = '15m'; 
const JWT_REFRESH_EXPIRES = '7d';  
const SALT_ROUNDS = 12; // ✅ 

// 📊 Rate limiting en memoria (para producción usar Redis)
const loginAttempts = new Map(); // { email: { count, lockedUntil } }
const MAX_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000; 


 //REGISTRO DE USUARIOS
exports.register = async (req, res) => {
  try {
    const { email, password, nombre_completo, telefono, rol, pyme_id } = req.body;

    // Validación de campos obligatorios
    if (!email || !password || !nombre_completo || !rol) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan campos obligatorios: email, password, nombre_completo, rol' 
      });
    }

    // Validar que el rol sea válido
    const rolesValidos = ['ADMINISTRADOR', 'PYME', 'BODEGA', 'TRANSPORTISTA'];
    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rol inválido. Valores permitidos: ADMINISTRADOR, PYME, BODEGA, TRANSPORTISTA' 
      });
    }

    // Validar que rol PYME tenga pyme_id
    if (rol === 'PYME' && !pyme_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'El rol PYME requiere pyme_id' 
      });
    }

    // Verificar si el email ya existe
    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(409).json({ 
        success: false, 
        message: 'El email ya está registrado' 
      });
    }

    // ✅ RNF4: Bcrypt con 12 rounds según informe
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Crear usuario
    const newUser = await User.create({
      email,
      password_hash,
      nombre_completo,
      telefono: telefono || null,
      rol,
      pyme_id: rol === 'PYME' ? pyme_id : null,
      activo: true
    });

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser.id,
        email: newUser.email,
        nombre_completo: newUser.nombre_completo,
        rol: newUser.rol,
        pyme_id: newUser.pyme_id
      }
    });
  } catch (error) {
    console.error('❌ Error en register:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al registrar usuario', 
      details: error.message 
    });
  }
};

/**
 * 🔑 LOGIN CON ACCESS TOKEN + REFRESH TOKEN
 * RF1: JWT con tokens de acceso (15 min) y refresh tokens (7 días)
 * RNF4: Rate limiting - máximo 5 intentos en 15 minutos
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;

    // ✅ RNF4: Rate limiting - máximo 5 intentos fallidos en 15 min
    const attempts = loginAttempts.get(email);
    if (attempts && attempts.lockedUntil > Date.now()) {
      const minutesLeft = Math.ceil((attempts.lockedUntil - Date.now()) / 60000);
      return res.status(429).json({ 
        success: false, 
        message: `Cuenta bloqueada temporalmente. Intente en ${minutesLeft} minutos.` 
      });
    }

    // 1) Buscar usuario por email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Incrementar intentos fallidos
      incrementLoginAttempts(email);
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales inválidas' 
      });
    }

    // 2) Validar estado del usuario
    if (user.activo === false) {
      return res.status(403).json({ 
        success: false, 
        message: 'Usuario inactivo. Contacte al administrador.' 
      });
    }

    // 3) ✅ Comparar contraseña con bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      // Incrementar intentos fallidos
      incrementLoginAttempts(email);
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales inválidas' 
      });
    }

    // ✅ Login exitoso - limpiar intentos fallidos
    loginAttempts.delete(email);

    // 4) ✅ RF1: Generar ACCESS TOKEN (15 minutos)
    const accessToken = jwt.sign(
      { 
        id: user.id, 
        rol: user.rol, 
        pyme_id: user.pyme_id,
        type: 'access'
      },
      JWT_SECRET,
      { expiresIn: JWT_ACCESS_EXPIRES }
    );

    // 5) ✅ Generar REFRESH TOKEN (7 días)
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    // 6) Guardar refresh token en BD con expiración de 7 días
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
      user_id: user.id,
      token_hash: refreshTokenHash,
      expires_at: expiresAt,
      ip_address: clientIP
    });

    return res.json({
      success: true,
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutos en segundos
      user: {
        id: user.id,
        email: user.email,
        nombre_completo: user.nombre_completo,
        rol: user.rol,
        pyme_id: user.pyme_id
      }
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error en el servidor' 
    });
  }
};

/**
 * 🔄 RENOVAR ACCESS TOKEN CON REFRESH TOKEN
 * RF1: Refresh tokens con rotación automática
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Refresh token requerido' 
      });
    }

    // 1) Buscar todos los refresh tokens activos
    const tokens = await RefreshToken.findAll({
      where: {
        revoked: false,
        expires_at: { [Op.gt]: new Date() }
      },
      include: [{ model: User }]
    });

    // 2) Verificar el refresh token
    let validToken = null;
    for (const token of tokens) {
      const match = await bcrypt.compare(refreshToken, token.token_hash);
      if (match) {
        validToken = token;
        break;
      }
    }

    if (!validToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'Refresh token inválido o expirado' 
      });
    }

    const user = validToken.User;

    // 3) ✅ Rotación: Revocar el refresh token usado
    await validToken.update({ revoked: true });

    // 4) Generar NUEVO access token
    const newAccessToken = jwt.sign(
      { 
        id: user.id, 
        rol: user.rol, 
        pyme_id: user.pyme_id,
        type: 'access'
      },
      JWT_SECRET,
      { expiresIn: JWT_ACCESS_EXPIRES }
    );

    // 5) ✅ Generar NUEVO refresh token (rotación)
    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
      user_id: user.id,
      token_hash: newRefreshTokenHash,
      expires_at: expiresAt,
      ip_address: req.ip || req.connection.remoteAddress
    });

    return res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900
    });
  } catch (error) {
    console.error('❌ Error en refreshToken:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al renovar token' 
    });
  }
};

/**
 * 🚪 LOGOUT - Revocar refresh token
 */
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Buscar y revocar el refresh token
      const tokens = await RefreshToken.findAll({
        where: { revoked: false }
      });

      for (const token of tokens) {
        const match = await bcrypt.compare(refreshToken, token.token_hash);
        if (match) {
          await token.update({ revoked: true });
          break;
        }
      }
    }

    return res.json({
      success: true,
      message: 'Logout exitoso'
    });
  } catch (error) {
    console.error('❌ Error en logout:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al cerrar sesión' 
    });
  }
};

/**
 * 📧 RECUPERACIÓN DE CONTRASEÑA (Parte 1: Solicitar token)
 * RF1: Recuperación mediante email con tokens de 1 hora
 */
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    
    // Por seguridad, siempre responder igual
    if (!user) {
      return res.json({
        success: true,
        message: 'Si el email existe, recibirá instrucciones para recuperar su contraseña'
      });
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await user.update({
      reset_token_hash: resetTokenHash,
      reset_token_expires: resetTokenExpires
    });

    // TODO: Enviar email con el token
    // const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    // await sendEmail(user.email, 'Recuperación de contraseña', resetLink);

    console.log(`🔗 Token de recuperación para ${email}: ${resetToken}`);

    return res.json({
      success: true,
      message: 'Si el email existe, recibirá instrucciones para recuperar su contraseña'
    });
  } catch (error) {
    console.error('❌ Error en requestPasswordReset:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al procesar solicitud' 
    });
  }
};

/**
 * 🔄 RECUPERACIÓN DE CONTRASEÑA (Parte 2: Resetear con token)
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Buscar usuarios con token activo
    const users = await User.findAll({
      where: {
        reset_token_expires: { [Op.gt]: new Date() }
      }
    });

    let validUser = null;
    for (const user of users) {
      if (user.reset_token_hash) {
        const match = await bcrypt.compare(token, user.reset_token_hash);
        if (match) {
          validUser = user;
          break;
        }
      }
    }

    if (!validUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token inválido o expirado' 
      });
    }

    // Actualizar contraseña
    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    await validUser.update({
      password_hash: newPasswordHash,
      reset_token_hash: null,
      reset_token_expires: null
    });

    return res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('❌ Error en resetPassword:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al resetear contraseña' 
    });
  }
};

// 🛠️ Función auxiliar para rate limiting
function incrementLoginAttempts(email) {
  const attempts = loginAttempts.get(email) || { count: 0, lockedUntil: 0 };
  attempts.count += 1;

  if (attempts.count >= MAX_ATTEMPTS) {
    attempts.lockedUntil = Date.now() + LOCK_TIME;
    console.log(`🔒 Cuenta ${email} bloqueada por 30 minutos`);
  }

  loginAttempts.set(email, attempts);

  // Limpiar después de 15 minutos si no alcanzó el máximo
  setTimeout(() => {
    const current = loginAttempts.get(email);
    if (current && current.count < MAX_ATTEMPTS) {
      loginAttempts.delete(email);
    }
  }, 15 * 60 * 1000);
}

