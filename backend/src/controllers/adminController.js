const bcrypt = require('bcrypt');
const User = require('../models/User');

const VALID_ROLES = ['PYME', 'BODEGA', 'TRANSPORTISTA', 'ADMINISTRADOR'];

exports.createUser = async (req, res) => {
  try {
    const {
      email,
      password,
      nombre_completo = null,
      telefono = null,
      rol,
      pyme_id = null,
      activo = true
    } = req.body || {};

    if (!email || !password || !rol) {
      return res.status(400).json({ message: 'email, password y rol son obligatorios' });
    }

    const emailClean = String(email).trim().toLowerCase();
    const rolClean = String(rol).trim().toUpperCase();

    if (!VALID_ROLES.includes(rolClean)) {
      return res.status(400).json({ message: `rol inválido. Usa: ${VALID_ROLES.join(', ')}` });
    }

    // Si rol es PYME, pyme_id es obligatorio
    let pymeIdFinal = null;
    if (rolClean === 'PYME') {
      const n = Number(pyme_id);
      if (!Number.isInteger(n) || n <= 0) {
        return res.status(400).json({ message: 'pyme_id es obligatorio para rol PYME' });
      }
      pymeIdFinal = n;
    }

    const exists = await User.findOne({ where: { email: emailClean } });
    if (exists) return res.status(409).json({ message: 'Email ya existe' });

    const password_hash = await bcrypt.hash(String(password), 10);

    const created = await User.create({
      email: emailClean,
      password_hash,
      nombre_completo,
      telefono,
      rol: rolClean,
      pyme_id: pymeIdFinal,
      activo: activo !== false
    });

    return res.json({
      ok: true,
      usuario: {
        id: created.id,
        email: created.email,
        rol: created.rol,
        pyme_id: created.pyme_id,
        activo: created.activo
      }
    });
  } catch (e) {
    console.error('createUser error:', e);
    return res.status(500).json({ message: 'Error creando usuario' });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const rows = await User.findAll({
      attributes: ['id', 'email', 'nombre_completo', 'telefono', 'rol', 'pyme_id', 'activo', 'fecha_creacion'],
      order: [['id', 'DESC']]
    });
    return res.json({ ok: true, usuarios: rows });
  } catch (e) {
    console.error('listUsers error:', e);
    return res.status(500).json({ message: 'Error listando usuarios' });
  }
};
