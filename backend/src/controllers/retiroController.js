const Retiro = require('../models/Retiro');
const RetiroDetalle = require('../models/RetiroDetalle');
const Product = require('../models/Product');
const sequelize = require('../config/database');

// 1. CREAR RETIRO
exports.createRetiro = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { direccion, comuna, rango, referencia, detalles } = req.body;
    const pyme_id = req.user.id;

    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const codigo = `RET-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${suffix}`;

    const nuevoRetiro = await Retiro.create({
      codigo, pyme_id, direccion, comuna, estado: 'SOLICITADO'
    }, { transaction: t });

    if (detalles && detalles.length > 0) {
      const detallesData = detalles.map(d => ({
        retiro_id: nuevoRetiro.id,
        producto_id: d.producto_id,
        cantidad: d.cantidad
      }));
      await RetiroDetalle.bulkCreate(detallesData, { transaction: t });
    }
    await t.commit();
    res.status(201).json({ message: 'Retiro creado exitosamente', retiro: nuevoRetiro });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error al crear retiro' });
  }
};

// 2. OBTENER INFO POR QR
exports.getRetiroByCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;
    const retiro = await Retiro.findOne({
      where: { codigo },
      include: [
        { 
          model: RetiroDetalle, 
          as: 'detalles', 
          include: [{ model: Product, as: 'producto' }] 
        }
      ]
    });
    if (!retiro) return res.status(404).json({ message: 'Retiro no encontrado' });
    res.json(retiro);
  } catch (error) {
    res.status(500).json({ message: 'Error al leer QR' });
  }
};

// 3. PROCESAR RECEPCIÓN
exports.procesarRecepcionQR = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { codigo } = req.body;
    const retiro = await Retiro.findOne({ 
      where: { codigo },
      include: [{ model: RetiroDetalle, as: 'detalles' }]
    });

    if (!retiro) throw new Error('Retiro no existe');
    if (retiro.estado === 'RECEPCIONADO') throw new Error('Este retiro ya fue procesado');

    for (const item of retiro.detalles) {
      await Product.increment('cantidad_disponible', { 
        by: item.cantidad,
        where: { id: item.producto_id },
        transaction: t
      });
    }

    retiro.estado = 'RECEPCIONADO';
    retiro.fecha_recepcion = new Date();
    await retiro.save({ transaction: t });
    await t.commit();

    res.json({ message: 'Inventario actualizado', nuevo_estado: 'RECEPCIONADO' });
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
};

// 4. OBTENER MIS RETIROS (PYME)
exports.getMyRetiros = async (req, res) => {
  try {
    const pyme_id = req.user.id; 
    const retiros = await Retiro.findAll({
      where: { pyme_id },
      include: [
        { 
          model: RetiroDetalle, 
          as: 'detalles', 
          include: [{ model: Product, as: 'producto' }] 
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(retiros);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener historial' });
  }
};