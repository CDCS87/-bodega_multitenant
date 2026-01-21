const router = require('express').Router();
const retiroController = require('../controllers/retiroController');
const auth = require('../middlewares/authMiddleware');

router.post('/', auth, retiroController.create);

// buscar por codigo con scope seguro (pyme o bodega)
router.get('/codigo/:codigo', auth, retiroController.getByCodigo);

module.exports = router;




