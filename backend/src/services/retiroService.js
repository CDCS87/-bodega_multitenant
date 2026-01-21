const OrdenRetiro = require('../models/OrdenRetiro');
const OrdenRetiroDetalle = require('../models/OrdenRetiroDetalle');
const Zona = require('../models/Zona');
const Transportista = require('../models/Transportista');

async function buscarPorCodigo(codigo, scope) {
  const retiro = await OrdenRetiro.findByCodigo(codigo, scope);

  if (!retiro) return null;

  const detalle = await OrdenRetiroDetalle.listByRetiroId(retiro.id);
  return { ...retiro, detalle };
}

function generarCodigo(pymeId) {
  const ymd = new Date().toISOString().slice(0,10).replaceAll('-','');
  const rand = String(Math.floor(Math.random()*9999)).padStart(4,'0');
  return `RET|${pymeId}-${ymd}-${rand}`;
}

async function crearRetiro({ usuario, data }) {
  const zona = await Zona.findByComuna(data.comuna);

  // turno según rango
  const turno = data.rango === 'CORTE_1' ? 'MATUTINO' : 'VESPERTINO';
  const transportista = zona
    ? await Transportista.findDisponible(zona.id, turno)
    : null;

  const estado = transportista ? 'ASIGNADO' : 'SOLICITADO';

  // 1) insert cabecera
  const retiro = await OrdenRetiro.insert({
    codigo: generarCodigo(usuario.pyme_id),
    pyme_id: usuario.pyme_id,
    direccion_retiro: data.direccion_retiro,
    comuna: data.comuna,
    fecha_solicitada: data.fecha_solicitada, // date
    transportista_id: transportista?.id ?? null,
    zona_id: zona?.id ?? null,
    estado,
    observaciones: data.observaciones ?? null,
    creado_por: usuario.id
  });

  // 2) insert detalle
  const detalle = await OrdenRetiroDetalle.insertMany(
    retiro.id,
    Array.isArray(data.items) ? data.items : []
  );

  return { retiro, detalle, transportista };
}


module.exports = { crearRetiro, buscarPorCodigo };
