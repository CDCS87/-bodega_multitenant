// frontend/src/app/services/despacho.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export type DespachoListItem = {
  id: number;
  codigo: string;
  estado: string;
  destinatario_nombre: string;
  comuna: string;
  fecha_solicitada?: string | null;
  zona_id?: number | null;
  pyme_id?: number | null;
  qr_code?: string | null;
};

export type DespachoDetalleItem = {
  id: number;
  orden_despacho_id: number;
  producto_id: number;
  nombre_producto: string;
  sku: string;
  cantidad_solicitada: number;
  cantidad_preparada: number;
  cantidad_entregada: number;
  observaciones?: string | null;
};

export type DespachoDetalle = {
  id: number;
  codigo: string;
  pyme_id: number;
  estado: string;
  destinatario_nombre: string;
  destinatario_telefono?: string | null;
  destinatario_email?: string | null;
  direccion_entrega: string;
  comuna: string;
  zona_id?: number | null;
  fecha_solicitada?: string | null;
  fecha_picking?: string | null;
  fecha_preparado?: string | null;
  transportista_id?: number | null;
  bodeguero_id?: number | null;
  observaciones?: string | null;
  qr_code?: string | null;
  detalle: DespachoDetalleItem[];
};

export type PrepararPayload = {
  items: { detalle_id: number; cantidad_preparada: number }[];
};

@Injectable({ providedIn: 'root' })
export class DespachoService {
  private readonly API_URL = `${environment.apiUrl}/api/despachos`;

  constructor(private http: HttpClient) {}

  getDespachos() {
    return this.http
      .get<any>(this.API_URL)
      .pipe(map(r => r.ordenes as DespachoListItem[]));
  }

  getDespachoById(id: number) {
    return this.http
      .get<any>(`${this.API_URL}/${id}`)
      .pipe(map(r => r.orden as DespachoDetalle));
  }

  scanDespacho(codigoOrQr: string) {
    const safe = encodeURIComponent(codigoOrQr.trim());
    return this.http
      .get<any>(`${this.API_URL}/scan/${safe}`)
      .pipe(map(r => r.orden as DespachoDetalle));
  }

  iniciarPicking(id: number) {
    return this.http.put<any>(`${this.API_URL}/${id}/picking`, {});
  }

  confirmarPreparado(id: number, payload: PrepararPayload) {
    return this.http.put<any>(`${this.API_URL}/${id}/preparar`, payload);
  }
}



