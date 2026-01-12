const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');

// 👇 SOLO /
router.get('/', authMiddleware, productController.getProducts);

module.exports = router;


