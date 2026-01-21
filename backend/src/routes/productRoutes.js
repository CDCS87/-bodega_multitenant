const router = require('express').Router();
const productController = require('../controllers/productController');
const auth = require('../middlewares/authMiddleware');

// listar/buscar (q, barcode, activo) -> /api/products
router.get('/', auth, productController.getProducts);

// crear -> /api/products
router.post('/', auth, productController.createProduct);

// detalle/editar/borrar -> /api/products/:id
router.get('/:id', auth, productController.getProductById);
router.put('/:id', auth, productController.updateProduct);
router.delete('/:id', auth, productController.deleteProduct);

module.exports = router;





