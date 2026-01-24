// backend/src/controllers/retiroController.js
const Retiro = require('../models/Retiro');
const RetiroDetalle = require('../models/RetiroDetalle');
const Product = require('../models/Product');
const sequelize = require('../config/database');

// ==========================================
// 1. CREAR RETIRO (Pyme)
// ==========================================
exports.crearRetiro = async (req, res) => {
  console.log("👉 INICIO: Creando solicitud de retiro...");
  const t = await sequelize.transaction();

  try {
    const { direccion, comuna, rango, referencia, observaciones, detalles } = req.body;
    
    // Validamos usuario
    if (!req.user || !req.user.id) throw new Error("Usuario no autenticado.");
    const usuario_id = req.user.id;
    const pyme_id = req.user.pyme_id || req.user.id;

    // 1. Generar Código Único (Ej: RET-20260124-ABCD)
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const codigo = `RET-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${suffix}`;

    // 2. Concatenación Inteligente de Observaciones
    let obsTexto = observaciones || '';
    if (referencia) obsTexto += ` | Ref: ${referencia}`;
    if (rango) obsTexto += ` | Horario: ${rango}`;

    // 3. Crear Cabecera (Tabla ordenes_retiro)
    const nuevoRetiro = await Retiro.create({
      codigo,
      pyme_id,
      direccion, 
      comuna,
      fecha_solicitada: new Date(),
      estado: 'SOLICITADO',
      observaciones: obsTexto,
      creado_por: usuario_id,
      fecha_creacion: new Date()
    }, { transaction: t });

    console.log("✅ Cabecera creada ID:", nuevoRetiro.id);

    // 4. Crear Detalles (Tabla ordenes_retiro_detalle)
    if (detalles && detalles.length > 0) {
      const detallesData = [];

      for (const d of detalles) {
        const prodInfo = await Product.findByPk(d.producto_id); 
        
        detallesData.push({
          orden_retiro_id: nuevoRetiro.id,
          producto_id: d.producto_id,
          cantidad_esperada: d.cantidad,
          nombre_producto: prodInfo ? prodInfo.nombre : 'Producto desconocido',
          sku_generado: prodInfo ? prodInfo.sku : 'S/N'
        });
      }

      await RetiroDetalle.bulkCreate(detallesData, { transaction: t });
      console.log("✅ Detalles guardados correctamente");
    }

    await t.commit();
    res.status(201).json({ message: 'Retiro creado', retiro: nuevoRetiro });

  } catch (error) {
    await t.rollback();
    
    console.log("\n🔴 ============ ERROR DETECTADO ============");
    
    if (error.parent) {
      console.log("❌ Error SQL:", error.parent.message);
      console.log("📜 Detalle:", error.parent.detail);
      console.log("🔢 Código Postgres:", error.parent.code);
    }
    
    if (error.errors) {
      console.log("❌ Errores de validación:");
      error.errors.forEach(e => console.log(`   -> ${e.message} (Campo: ${e.path})`));
    }

    console.log("❌ Mensaje General:", error.message);
    console.log("==========================================\n");

    res.status(500).json({ 
      message: 'Error al crear retiro', 
      error_real: error.parent ? error.parent.detail || error.parent.message : error.message
    });
  }
};

// ==========================================
// 2. LISTAR MIS RETIROS (Historial Pyme)
// ==========================================
exports.getMyRetiros = async (req, res) => {
  try {
    const pyme_id = req.user.pyme_id || req.user.id;
    const retiros = await Retiro.findAll({
      where: { pyme_id },
      order: [['fecha_creacion', 'DESC']]
    });
    res.json(retiros);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener historial' });
  }
};

// ==========================================
// 3. INGRESO EN BODEGA (Al Escanear QR)
// ==========================================
exports.ingresarEnBodega = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { codigo } = req.body; 

    if (!codigo) {
      return res.status(400).json({ message: 'Código QR requerido' });
    }

    console.log("📦 Procesando ingreso Bodega QR:", codigo);

    const retiro = await Retiro.findOne({ 
      where: { codigo }
    });

    if (!retiro) {
      await t.rollback();
      return res.status(404).json({ message: 'Orden de retiro no encontrada' });
    }

    if (retiro.estado === 'INGRESADO_BODEGA' || retiro.estado === 'RECEPCIONADO') {
      await t.rollback();
      return res.status(400).json({ 
        message: `Este retiro ya fue procesado anteriormente.` 
      });
    }

    retiro.estado = 'INGRESADO_BODEGA';
    retiro.fecha_ingreso_bodega = new Date();
    
    await retiro.save({ transaction: t });
    await t.commit();

    console.log("✅ Ingreso exitoso:", codigo);

    return res.status(200).json({ 
      success: true, 
      message: '✅ Ingreso a bodega exitoso',
      retiro: {
        codigo: retiro.codigo,
        estado: retiro.estado,
        fecha: retiro.fecha_ingreso_bodega
      }
    });

  } catch (error) {
    await t.rollback();
    console.error('Error al escanear ingreso:', error);
    res.status(500).json({ message: 'Error interno al procesar ingreso' });
  }
}; // ✅ CIERRE CORRECTO de ingresarEnBodega

// ==========================================
// 4. OBTENER RETIROS PENDIENTES (Bodega)
// ==========================================
exports.getPendientes = async (req, res) => {
  try {
    const retiros = await Retiro.findAll({
      where: { estado: ['SOLICITADO', 'EN_RUTA'] },
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
    res.status(500).json({ message: 'Error al obtener retiros pendientes' });
  }
}; 