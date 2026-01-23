const Retiro = require('../models/Retiro');
const RetiroDetalle = require('../models/RetiroDetalle');
const Product = require('../models/Product');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid'); // npm install uuid

// 1. CREAR RETIRO (Lo que hace la Pyme desde la App)
exports.createRetiro = async (req, res) => {
  const t = await sequelize.transaction(); // Transacción de seguridad

  try {
    const { direccion, comuna, rango, referencia, detalles } = req.body;
    const pyme_id = req.user.id; // Asumiendo que usas JWT

    // A. Generar Código Único para el QR (Ej: RET-20231025-ABCD)
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const codigo = `RET-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${suffix}`;

    // B. Guardar Cabecera
    const nuevoRetiro = await Retiro.create({
      codigo,
      pyme_id,
      direccion,
      comuna,
      estado: 'SOLICITADO'
    }, { transaction: t });

    // C. Guardar Detalles (Productos)
    if (detalles && detalles.length > 0) {
      const detallesData = detalles.map(d => ({
        retiro_id: nuevoRetiro.id,
        producto_id: d.producto_id,
        cantidad: d.cantidad
      }));
      await RetiroDetalle.bulkCreate(detallesData, { transaction: t });
    }

    await t.commit(); // Confirmar guardado

    res.status(201).json({ 
      message: 'Retiro creado exitosamente', 
      retiro: nuevoRetiro 
    });

  } catch (error) {
    await t.rollback(); // Cancelar todo si falla algo
    console.error(error);
    res.status(500).json({ message: 'Error al crear retiro' });
  }
};

// 2. OBTENER INFO POR QR (Para que la bodega vea el Checklist)
exports.getRetiroByCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;
    const retiro = await Retiro.findOne({
      where: { codigo },
      include: [
        { 
          model: RetiroDetalle, 
          as: 'detalles',
          include: [{ model: Product, as: 'producto' }] // Traer nombres de productos
        }
      ]
    });

    if (!retiro) return res.status(404).json({ message: 'Retiro no encontrado' });

    res.json(retiro);
  } catch (error) {
    res.status(500).json({ message: 'Error al leer QR' });
  }
};

// 3. PROCESAR RECEPCIÓN (¡La Magia Automática!)
// Esto se ejecuta cuando el bodeguero le da "Confirmar Recepción"
exports.procesarRecepcionQR = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { codigo } = req.body; // El código escaneado

    // A. Buscar el retiro
    const retiro = await Retiro.findOne({ 
      where: { codigo },
      include: [{ model: RetiroDetalle, as: 'detalles' }]
    });

    if (!retiro) throw new Error('Retiro no existe');
    if (retiro.estado === 'RECEPCIONADO') throw new Error('Este retiro ya fue procesado');

    // B. ACTUALIZAR INVENTARIO AUTOMÁTICAMENTE
    // Recorremos cada producto del retiro y sumamos al stock
    for (const item of retiro.detalles) {
      await Product.increment('cantidad_disponible', { 
        by: item.cantidad,
        where: { id: item.producto_id },
        transaction: t
      });
    }

    // C. Actualizar estado del Retiro
    retiro.estado = 'RECEPCIONADO';
    retiro.fecha_recepcion = new Date();
    await retiro.save({ transaction: t });

    await t.commit();

    res.json({ 
      message: 'Inventario actualizado correctamente', 
      nuevo_estado: 'RECEPCIONADO' 
    });

  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
};

