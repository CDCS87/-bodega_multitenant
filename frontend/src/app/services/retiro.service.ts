import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export type RangoRetiro = 'CORTE_1' | 'CORTE_2';

export interface CrearRetiroPayload {
  comuna: string;
  direccion: string;
  rango: RangoRetiro;
  items?: Array<{ producto_id: string; cantidad: number }>;
  observaciones?: string | null;
  fecha_solicitada?: string; // YYYY-MM-DD
}

@Injectable({ providedIn: 'root' })
export class RetiroService {
  private readonly API_URL = `${environment.apiUrl}/api/retiros`;

  constructor(private http: HttpClient) {}

  // ✅ PYME: crear retiro
  crearRetiro(payload: CrearRetiroPayload) {
    return this.http.post<any>(this.API_URL, payload);
  }

  // ✅ (PYME/BODEGA): buscar por código
  buscarPorCodigo(codigo: string) {
    return this.http.get<any>(`${this.API_URL}/codigo/${encodeURIComponent(codigo)}`);
  }

  // ✅ BODEGA: listar retiros pendientes (para recepción)
  getPendientesBodega() {
    return this.http.get<any>(`${this.API_URL}/bodega/pendientes`);
  }

  // ✅ BODEGA: escanear/ingresar retiro por código (para recepción)
  scanRetiro(codigo: string) {
    return this.http.post<any>(`${this.API_URL}/bodega/scan`, { codigo });
  }
}




