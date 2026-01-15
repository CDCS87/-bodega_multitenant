// backend/src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { 
  authMiddleware, 
  requireRole, 
  validatePymeAccess,
  authenticateAndAuthorize 
} = require('../middlewares/authMiddleware');

/**
 * 📦 RUTAS DE PRODUCTOS
 * Todas requieren autenticación JWT
 * RF1: Control de acceso basado en roles (RBAC)
 * RF3: Gestión diferenciada de productos con separación multi-tenant
 */

// ✅ GET /api/products - Obtener productos
// PYME: Solo sus productos | ADMIN/BODEGA: Todos los productos
router.get(
  '/',
  authMiddleware,
  requireRole('PYME', 'ADMINISTRADOR', 'BODEGA'),
  validatePymeAccess,
  productController.getProducts
);

// ✅ GET /api/products/:id - Obtener un producto por ID
// PYME: Solo sus productos | ADMIN/BODEGA: Cualquier producto
router.get(
  '/:id',
  authMiddleware,
  requireRole('PYME', 'ADMINISTRADOR', 'BODEGA'),
  validatePymeAccess,
  productController.getProductById
);

// ✅ POST /api/products - Crear producto
// Solo PYME (sus productos) y ADMINISTRADOR
router.post(
  '/',
  authMiddleware,
  requireRole('PYME', 'ADMINISTRADOR'),
  validatePymeAccess,
  productController.createProduct
);

// ✅ PUT /api/products/:id - Actualizar producto
// PYME: Solo sus productos | ADMINISTRADOR: Cualquier producto
router.put(
  '/:id',
  authMiddleware,
  requireRole('PYME', 'ADMINISTRADOR'),
  validatePymeAccess,
  productController.updateProduct
);

// ✅ DELETE /api/products/:id - Eliminar/desactivar producto
// PYME: Solo sus productos | ADMINISTRADOR: Cualquier producto
router.delete(
  '/:id',
  authMiddleware,
  requireRole('PYME', 'ADMINISTRADOR'),
  validatePymeAccess,
  productController.deleteProduct
);

module.exports = router;



