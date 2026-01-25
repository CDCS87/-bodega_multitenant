const bcrypt = require('bcrypt');
const { User, Pyme, Transportista,} = require('../models');
const sequelize = require('../config/database');
const Zona = require('../models/Zona');

/**
 * CREAR USUARIO
 */
exports.createUser = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { email, password, nombre_completo, rol, pymeData, transportistaData, telefono } = req.body;

        const password_hash = await bcrypt.hash(String(password), 10);
        const created = await User.create({
            email: email.toLowerCase().trim(),
            password_hash,
            nombre_completo: nombre_completo ? nombre_completo.toUpperCase().trim() : null,
            telefono: telefono || null,
            rol: rol.toUpperCase(),
            activo: true
        }, { transaction: t });

        if (rol.toUpperCase() === 'PYME' && pymeData) {
            const nuevaPyme = await Pyme.create({
                codigoPyme: `TEMP-${Date.now()}`,
                nombrePyme: pymeData.nombrePyme.toUpperCase(),
                rut: pymeData.rut,
                direccionPyme: pymeData.direccionPyme,
                comuna: pymeData.comuna,
                contactoNombre: pymeData.contactoNombre.toUpperCase(),
                contactoEmail: pymeData.contactoEmail.toLowerCase(),
                contactoTelefono: pymeData.contactoTelefono,
                volumenContratado: pymeData.volumenContratado || 0
            }, { transaction: t });
            
            created.pyme_id = nuevaPyme.id;
            await created.save({ transaction: t });
        }

        if (rol.toUpperCase() === 'TRANSPORTISTA' && transportistaData) {
            await Transportista.create({
                usuario_id: created.id,
                rut: transportistaData.rut,
                patenteVehiculo: transportistaData.patenteVehiculo.toUpperCase(),
                capacidadCarga: transportistaData.capacidadCarga || 0,
                // Forzamos mayúsculas para cumplir con el CHECK de la DB
                turno: transportistaData.turno ? transportistaData.turno.toUpperCase() : 'MATUTINO',
                zonaAsignadaId: transportistaData.zonaAsignadaId,
                activo: true
            }, { transaction: t });
}

        await t.commit();
        return res.status(201).json({ ok: true, usuario: created });
    } catch (e) {
        await t.rollback();
        console.error('ERROR:', e);
        return res.status(500).json({ message: 'Error en el servidor', error: e.message });
    }
};

/**
 * ACTUALIZAR USUARIO 
 */
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, nombre_completo, rol, telefono, password } = req.body;
        
        const usuario = await User.findByPk(id);
        if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

        usuario.email = email.toLowerCase().trim();
        usuario.nombre_completo = nombre_completo ? nombre_completo.toUpperCase().trim() : usuario.nombre_completo;
        usuario.rol = rol.toUpperCase();
        usuario.telefono = telefono || usuario.telefono;

        if (password && password.trim() !== '') {
            usuario.password_hash = await bcrypt.hash(String(password), 10);
        }

        await usuario.save();
        return res.json({ ok: true, message: 'Actualizado' });
    } catch (e) {
        console.error('ERROR AL ACTUALIZAR:', e);
        return res.status(500).json({ message: 'Error al actualizar' });
    }
};

/**
 * LISTAR USUARIOS
 */
exports.listUsers = async (req, res) => {
    try {
        const usuarios = await User.findAll({
            attributes: ['id', 'email', 'nombre_completo', 'rol', 'activo', 'pyme_id'],
            order: [['id', 'ASC']]
        });
        return res.json(usuarios);
    } catch (error) {
        console.error('ERROR AL LISTAR:', error);
        return res.status(500).json({ message: 'Error al obtener usuarios' });
    }
};

/**
 * ELIMINAR USUARIO
 */
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.destroy({ where: { id } });
        return res.json({ ok: true, message: 'Eliminado' });
    } catch (e) {
        console.error('ERROR AL ELIMINAR:', e);
        return res.status(500).json({ message: 'Error al eliminar' });
    }
};

// Obtener lista de zonas para los selectores
exports.listZonas = async (req, res) => {
    try {
        // Al usar el modelo Zona que arreglamos, Sequelize ya sabe 
        // que debe buscar en 'zonas_geograficas'
        const zonas = await Zona.findAll({
            where: { activo: true },
            order: [['nombre', 'ASC']]
        }); 
        return res.status(200).json(zonas); 
    } catch (e) {
        console.error('ERROR AL LISTAR ZONAS:', e);
        return res.status(500).json({ message: 'Error al obtener zonas desde la DB' });
    }
};