// backend/src/controllers/productController.js
const Product = require('../models/Product');
const { Op } = require('sequelize');

/**
 * 📦 OBTENER PRODUCTOS DE LA PYME
 * RF3: Gestión diferenciada de productos
 * RF1: Separación estricta multi-tenant por pyme_id
 */
exports.getProducts = async (req, res) => {
  try {
    // ✅ Validación multi-tenant
    if (req.user.rol === 'PYME') {
      if (!req.user.pyme_id) {
        return res.status(403).json({ 
          success: false,
          message: 'Usuario PYME sin empresa asignada' 
        });
      }

      // Filtrar por pyme_id del usuario autenticado
      const productos = await Product.findAll({
        where: { pyme_id: req.user.pyme_id },
        order: [['nombre', 'ASC']],
        attributes: [
          'id',
          'sku',
          'nombre',
          'descripcion',
          'tiene_codigo_original',
          'codigo_original',
          'caracteristicas_especificas',
          'precio_unitario',
          'cantidad_disponible',
          'cantidad_reservada',
          'stock_minimo',
          'ubicacion_id',
          'imagen_url',
          'activo',
          'created_at',
          'updated_at'
        ]
      });

      return res.json({
        success: true,
        count: productos.length,
        productos
      });
    }

    // ADMINISTRADOR puede ver todos los productos (con filtro opcional)
    if (req.user.rol === 'ADMINISTRADOR') {
      const { pyme_id } = req.query;

      const whereClause = pyme_id ? { pyme_id: parseInt(pyme_id) } : {};

      const productos = await Product.findAll({
        where: whereClause,
        order: [['nombre', 'ASC']],
        include: [
          {
            model: require('../models/Pyme'),
            as: 'pyme',
            attributes: ['id', 'codigo_pyme', 'razon_social']
          }
        ]
      });

      return res.json({
        success: true,
        count: productos.length,
        productos
      });
    }

    // BODEGA puede ver productos de todas las PYMEs
    if (req.user.rol === 'BODEGA') {
      const { pyme_id, activo } = req.query;

      const whereClause = {};
      if (pyme_id) whereClause.pyme_id = parseInt(pyme_id);
      if (activo !== undefined) whereClause.activo = activo === 'true';

      const productos = await Product.findAll({
        where: whereClause,
        order: [['pyme_id', 'ASC'], ['nombre', 'ASC']],
        include: [
          {
            model: require('../models/Pyme'),
            as: 'pyme',
            attributes: ['codigo_pyme', 'razon_social']
          }
        ]
      });

      return res.json({
        success: true,
        count: productos.length,
        productos
      });
    }

    // Otros roles no tienen acceso a productos
    return res.status(403).json({ 
      success: false,
      message: 'Su rol no tiene permisos para acceder a productos' 
    });

  } catch (error) {
    console.error('❌ Error al obtener productos:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor al cargar inventario',
      details: error.message 
    });
  }
};

/**
 * 📦 OBTENER UN PRODUCTO POR ID
 * RF3: Gestión diferenciada de productos
 */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const whereClause = { id: parseInt(id) };

    // ✅ Si es PYME, filtrar por su pyme_id
    if (req.user.rol === 'PYME') {
      whereClause.pyme_id = req.user.pyme_id;
    }

    const producto = await Product.findOne({
      where: whereClause,
      include: req.user.rol !== 'PYME' ? [
        {
          model: require('../models/Pyme'),
          as: 'pyme',
          attributes: ['codigo_pyme', 'razon_social']
        }
      ] : []
    });

    if (!producto) {
      return res.status(404).json({ 
        success: false,
        message: 'Producto no encontrado o no tiene acceso' 
      });
    }

    return res.json({
      success: true,
      producto
    });

  } catch (error) {
    console.error('❌ Error al obtener producto:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error al obtener producto',
      details: error.message 
    });
  }
};

/**
 * ➕ CREAR PRODUCTO (solo PYME y ADMINISTRADOR)
 * RF3: Gestión diferenciada de productos
 */
exports.createProduct = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      tiene_codigo_original,
      codigo_original,
      caracteristicas_especificas,
      precio_unitario,
      cantidad_disponible,
      stock_minimo,
      ubicacion_id
    } = req.body;

    // Validaciones básicas
    if (!nombre || precio_unitario === undefined || cantidad_disponible === undefined) {
      return res.status(400).json({ 
        success: false,
        message: 'Campos obligatorios: nombre, precio_unitario, cantidad_disponible' 
      });
    }

    // Determinar pyme_id según rol
    let pyme_id;
    if (req.user.rol === 'PYME') {
      pyme_id = req.user.pyme_id;
    } else if (req.user.rol === 'ADMINISTRADOR') {
      pyme_id = req.body.pyme_id;
      if (!pyme_id) {
        return res.status(400).json({ 
          success: false,
          message: 'El administrador debe especificar pyme_id' 
        });
      }
    } else {
      return res.status(403).json({ 
        success: false,
        message: 'Su rol no tiene permisos para crear productos' 
      });
    }

    // Generar SKU automático si no tiene código original
    let sku;
    if (tiene_codigo_original && codigo_original) {
      sku = codigo_original;
    } else {
      // RF3: Generar SKU automático PYME{ID}-AUTO-{NUM}
      const Pyme = require('../models/Pyme');
      const pyme = await Pyme.findByPk(pyme_id);
      
      const ultimoProducto = await Product.findOne({
        where: { pyme_id },
        order: [['id', 'DESC']]
      });

      const numero = ultimoProducto ? ultimoProducto.id + 1 : 1;
      sku = `${pyme.codigo_pyme}-AUTO-${String(numero).padStart(5, '0')}`;
    }

    // Crear producto
    const nuevoProducto = await Product.create({
      pyme_id,
      sku,
      nombre,
      descripcion: descripcion || null,
      tiene_codigo_original: tiene_codigo_original || false,
      codigo_original: codigo_original || null,
      caracteristicas_especificas: caracteristicas_especificas || {},
      precio_unitario,
      cantidad_disponible,
      cantidad_reservada: 0,
      stock_minimo: stock_minimo || 0,
      ubicacion_id: ubicacion_id || null,
      activo: true
    });

    return res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      producto: nuevoProducto
    });

  } catch (error) {
    console.error('❌ Error al crear producto:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error al crear producto',
      details: error.message 
    });
  }
};

/**
 * ✏️ ACTUALIZAR PRODUCTO
 * RF3: Gestión diferenciada de productos
 */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const whereClause = { id: parseInt(id) };

    // ✅ Si es PYME, solo puede editar sus productos
    if (req.user.rol === 'PYME') {
      whereClause.pyme_id = req.user.pyme_id;
    }

    const producto = await Product.findOne({ where: whereClause });

    if (!producto) {
      return res.status(404).json({ 
        success: false,
        message: 'Producto no encontrado o no tiene acceso' 
      });
    }

    // Campos que NO se pueden modificar directamente
    delete updates.id;
    delete updates.sku;
    delete updates.pyme_id;
    delete updates.cantidad_reservada; // Se modifica solo por el sistema

    await producto.update(updates);

    return res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      producto
    });

  } catch (error) {
    console.error('❌ Error al actualizar producto:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error al actualizar producto',
      details: error.message 
    });
  }
};

/**
 * 🗑️ ELIMINAR/DESACTIVAR PRODUCTO
 * RF3: Gestión diferenciada de productos
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const whereClause = { id: parseInt(id) };

    // ✅ Si es PYME, solo puede eliminar sus productos
    if (req.user.rol === 'PYME') {
      whereClause.pyme_id = req.user.pyme_id;
    }

    const producto = await Product.findOne({ where: whereClause });

    if (!producto) {
      return res.status(404).json({ 
        success: false,
        message: 'Producto no encontrado o no tiene acceso' 
      });
    }

    // Verificar si tiene stock reservado
    if (producto.cantidad_reservada > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No se puede eliminar un producto con stock reservado en órdenes activas' 
      });
    }

    // Desactivar en lugar de eliminar (soft delete)
    await producto.update({ activo: false });

    return res.json({
      success: true,
      message: 'Producto desactivado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al eliminar producto:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error al eliminar producto',
      details: error.message 
    });
  }
};

module.exports = exports;
