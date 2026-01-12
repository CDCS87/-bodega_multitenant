const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Buscar usuario
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    // 2. Validar contraseña con Bcrypt (según tu Informe 2)
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ message: 'Contraseña incorrecta' });

    // 3. Generar JWT de 15 min (según tu requerimiento RNF4)
    const token = jwt.sign(
      { id: user.id, rol: user.rol, pyme_id: user.pyme_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ success: true, token, user: { nombre: user.nombre_completo, rol: user.rol } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};