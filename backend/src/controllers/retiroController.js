const retiroService = require('../services/retiroService');

exports.create = async (req, res) => {
  try {
    const { comuna, direccion, rango, items, observaciones, fecha_solicitada } = req.body;

    if (!comuna || !direccion || !rango) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    // req.user viene del Middleware JWT
    if (!req.user?.id || !req.user?.pyme_id) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const result = await retiroService.crearRetiro({
      usuario: req.user,
      data: {
        comuna,
        direccion_retiro: direccion,          
        rango,
        fecha_solicitada: fecha_solicitada ?? new Date().toISOString().slice(0, 10),
        observaciones: observaciones ?? null,
        items: Array.isArray(items) ? items : []
      }
    });

    return res.status(201).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Error creando retiro' });
  }
};

exports.getByCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;

    let scope;
    if (req.user?.rol === 'PYME') {
      scope = { mode: 'PYME', pyme_id: req.user.pyme_id };
    } else if (req.user?.rol === 'BODEGA') {
      scope = { mode: 'BODEGA' };
    } else {
      return res.status(403).json({ message: 'Sin permisos' });
    }

    const retiro = await retiroService.buscarPorCodigo(decodeURIComponent(codigo), scope);

    if (!retiro) return res.status(404).json({ message: 'Retiro no encontrado' });
    return res.json(retiro);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Error buscando retiro' });
  }
};


