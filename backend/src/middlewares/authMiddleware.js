const jwt = require('jsonwebtoken');

/**
 * 🔐 MIDDLEWARE DE AUTENTICACIÓN JWT
 * RF1: Verificación de tokens JWT
 * RNF4: Validación estricta de tokens
 */
const authMiddleware = (req, res, next) => {
  try {
    const auth = req.headers.authorization;

    // 1) Validar presencia del header
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'Token faltante. Debe incluir header: Authorization: Bearer <token>' 
      });
    }

    // 2) Extraer token
    const token = auth.split(' ')[1];

    // 3) Validar que JWT_SECRET existe
    if (!process.env.JWT_SECRET) {
      console.error('❌ CRÍTICO: JWT_SECRET no está definido en .env');
      return res.status(500).json({ 
        success: false,
        message: 'Error de configuración del servidor' 
      });
    }

    // 4) Verificar y decodificar token
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // 5) Validar que sea un access token (no refresh token)
    if (payload.type && payload.type !== 'access') {
      return res.status(401).json({ 
        success: false,
        message: 'Token inválido. Debe usar access token.' 
      });
    }

    // 6) ✅ Inyectar usuario en request
    req.user = {
      id: payload.id,
      rol: payload.rol,
      pyme_id: payload.pyme_id
    };

    next();
  } catch (err) {
    console.error('❌ Error de autenticación:', err.message);

    // Mensajes específicos según el error
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expirado. Debe renovar su sesión.',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token inválido o malformado',
        code: 'TOKEN_INVALID'
      });
    }

    return res.status(401).json({ 
      success: false,
      message: 'Error de autenticación' 
    });
  }
};

/**
 * 🛡️ MIDDLEWARE DE AUTORIZACIÓN POR ROLES (RBAC)
 * RF1: Control de acceso basado en roles
 * @param {Array} rolesPermitidos - Array de roles que pueden acceder
 */
const requireRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Usuario no autenticado' 
      });
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ 
        success: false,
        message: `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}`,
        userRole: req.user.rol
      });
    }

    next();
  };
};

/**
 * 🏢 MIDDLEWARE DE VALIDACIÓN MULTI-TENANT
 * RF1: Separación estricta de datos por pyme_id
 * Asegura que las PYMEs solo accedan a sus propios datos
 */
const validatePymeAccess = (req, res, next) => {
  // Si el usuario es PYME, debe tener pyme_id
  if (req.user.rol === 'PYME') {
    if (!req.user.pyme_id) {
      console.error('❌ Usuario PYME sin pyme_id:', req.user.id);
      return res.status(403).json({ 
        success: false,
        message: 'Usuario PYME sin empresa asignada. Contacte al administrador.' 
      });
    }

    // ✅ Inyectar filtro automático por pyme_id en el query
    // Esto asegura separación multi-tenant
    req.pymeFilter = { pyme_id: req.user.pyme_id };
  }

  // Otros roles (ADMINISTRADOR, BODEGA, TRANSPORTISTA) no tienen pyme_id
  next();
};

/**
 * 🔒 MIDDLEWARE COMBINADO: Auth + RBAC + Multi-tenant
 * Uso recomendado para la mayoría de endpoints
 */
const authenticateAndAuthorize = (...rolesPermitidos) => {
  return [
    authMiddleware,
    requireRole(...rolesPermitidos),
    validatePymeAccess
  ];
};

module.exports = {
  authMiddleware,
  requireRole,
  validatePymeAccess,
  authenticateAndAuthorize
};



