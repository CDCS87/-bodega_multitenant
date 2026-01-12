const Product = require('../models/Product'); // Asegúrate de que la ruta a tu modelo sea correcta

exports.getProducts = async (req, res) => {
  try {
    // 1. Extraemos el pyme_id del usuario autenticado (inyectado por authMiddleware)
    const pyme_id = req.user.pyme_id; 

    // 2. Buscamos solo los productos que pertenecen a esa PYME específica
    const productos = await Product.findAll({
      where: { pyme_id: pyme_id },
      order: [['nombre', 'ASC']] // Opcional: ordenados por nombre
    });

    // 3. Enviamos el arreglo de productos (esto quita el error NG0900)
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error interno del servidor al cargar inventario' });
  }
};