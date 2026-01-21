const express = require('express');
const router = express.Router();
// 1. Importamos el Modelo Pyme (ya no necesitamos 'db' ni 'pool')
const Pyme = require('../models/Pyme'); 
const { authMiddleware: auth } = require('../middlewares/authMiddleware');

// GET /api/pyme/me
// 2. Usamos 'auth' (el nombre corto que definimos arriba)
router.get('/me', auth, async (req, res) => {
  try {
    const pymeId = req.user.pyme_id;

    // 3. Usamos Sequelize en vez de SQL manual (¡Mucho más limpio!)
    // findByPk = "Buscar por Primary Key (ID)"
    const pyme = await Pyme.findByPk(pymeId);

    if (!pyme) {
      return res.status(404).json({ message: 'Pyme no encontrada' });
    }

    return res.json(pyme);

  } catch (err) {
    console.error('[PYME] /me error:', err);
    return res.status(500).json({ message: 'Error interno' });
  }
});

module.exports = router;

