const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1️⃣ Verificamos que exista el header
  if (!authHeader) {
    return res.status(401).json({ message: 'Token no enviado' });
  }

  // 2️⃣ Extraemos el token "Bearer xxx"
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token malformado' });
  }

  try {
    // 3️⃣ Verificamos el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ Inyectamos el usuario en la request
    req.user = decoded;

    next(); // 🚀 seguimos al controller
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};
