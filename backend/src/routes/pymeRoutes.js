// GET /api/pyme/me
const express = require('express');
const router = express.Router();
const pool = require('../database'); 
const authMiddleware = require('../middleware/authMiddleware');

router.get('/pyme/me', authMiddleware, async (req, res) => {
  try {
    const pymeId = req.user.pyme_id; // <- viene del token
    const { rows } = await pool.query(
      `SELECT id, codigo_pyme, razon_social, rut, direccion,
              contacto_nombre, contacto_email, contacto_telefono,
              volumen_contratado, volumen_ocupado, activo
         FROM pymes
        WHERE id = $1`,
      [pymeId]
    );

    if (!rows.length) return res.status(404).json({ message: 'Pyme no encontrada' });
    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error interno' });
  }
});

module.exports = router;
