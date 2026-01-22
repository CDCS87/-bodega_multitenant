const express = require('express');
const router = express.Router();

// 1. Importamos el Middleware de Autenticación
const { authMiddleware } = require('../middlewares/authMiddleware');

// 2. Importamos los Modelos necesarios (Pyme y Product)
const Pyme = require('../models/Pyme');
const Product = require('../models/Product');

// ==========================================
// RUTA 1: Obtener datos de mi Pyme (/me)
// ==========================================
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // Debug: Ver qué usuario está intentando acceder
    console.log('🔍 [PYME] /me solicitado por usuario ID:', req.user.id, 'Pyme ID:', req.user.pyme_id);

    const pymeId = req.user.pyme_id;

    if (!pymeId) {
      return res.status(400).json({ 
        success: false, 
        message: 'El usuario no tiene una Pyme asignada en su token.' 
      });
    }

    // Buscar la Pyme en la base de datos
    const pyme = await Pyme.findByPk(pymeId);

    if (!pyme) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pyme no encontrada en la base de datos.' 
      });
    }

    return res.json(pyme);

  } catch (err) {
    console.error('❌ [PYME] Error crítico en /me:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor al buscar la Pyme.' 
    });
  }
});

// ==========================================
// RUTA 2: Obtener mis productos (/productos)
// ==========================================
// ¡Esta es la que te faltaba y causaba el error 404!
router.get('/productos', authMiddleware, async (req, res) => {
  try {
    const pymeId = req.user.pyme_id;

    // Buscar todos los productos que pertenezcan a esta pyme
    const productos = await Product.findAll({
      where: { 
        pyme_id: pymeId,
        activo: true // Opcional: Solo traer los activos si lo deseas
      },
      order: [['id', 'DESC']] // Ordenar por los más nuevos primero
    });

    console.log(`📦 [PYME] Se encontraron ${productos.length} productos para la Pyme ${pymeId}`);
    
    return res.json(productos);

  } catch (err) {
    console.error('❌ [PYME] Error al obtener productos:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al cargar el inventario.' 
    });
  }
});

// ==========================================
// RUTA 3: Métricas del Dashboard (/dashboard/metrics)
// ==========================================
// Agrego esta también por si la necesitas para los gráficos
router.get('/dashboard/metrics', authMiddleware, async (req, res) => {
  try {
    const pymeId = req.user.pyme_id;

    const totalProductos = await Product.count({ where: { pyme_id: pymeId, activo: true } });
    const stockBajo = await Product.count({ 
      where: { 
        pyme_id: pymeId, 
        activo: true,
        cantidad_disponible: 5 // Ejemplo: Menos de 5 unidades
      } 
    });

    // Simulamos métricas de volumen y órdenes por ahora
    const metrics = {
      productosActivos: totalProductos,
      ordenesActivas: 0, // Pendiente: Conectar con OrdenDespacho
      volumenOcupado: 120, // Ejemplo dummy
      volumenTotal: 500,   // Ejemplo dummy
      stockBajo: stockBajo
    };

    return res.json(metrics);

  } catch (err) {
    console.error('❌ [PYME] Error en métricas:', err);
    // En vez de fallar, devolvemos métricas en cero para no romper el dashboard
    return res.json({
      productosActivos: 0,
      ordenesActivas: 0,
      volumenOcupado: 0,
      volumenTotal: 0,
      stockBajo: 0
    });
  }
});

module.exports = router;

