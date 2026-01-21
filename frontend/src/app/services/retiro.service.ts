import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export type RangoRetiro = 'CORTE_1' | 'CORTE_2';

export interface CrearRetiroPayload {
  comuna: string;
  direccion: string;
  rango: RangoRetiro;

  // si aún no estás mandando detalle, déjalo opcional
  items?: Array<{
    producto_id: number;   // 👈 ideal number (tu DB usa int)
    cantidad: number;
  }>;

  observaciones?: string | null;
  fecha_solicitada?: string; // 'YYYY-MM-DD' opcional
}

@Injectable({ providedIn: 'root' })
export class RetiroService {
  private readonly API_URL = `${environment.apiUrl}/api/retiros`;

  constructor(private http: HttpClient) {}

  crearRetiro(payload: CrearRetiroPayload) {
    return this.http.post<any>(this.API_URL, payload);
  }

  buscarPorCodigo(codigo: string) {
    return this.http.get<any>(`${this.API_URL}/codigo/${encodeURIComponent(codigo)}`);
  }
}



