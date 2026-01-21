// GET /api/pyme/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const pymeId = req.user.pyme_id;

    const result = await pool.query(
      `SELECT id, razon_social, codigo_pyme
       FROM pymes
       WHERE id = $1 AND activo = true`,
      [pymeId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Pyme no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
});
