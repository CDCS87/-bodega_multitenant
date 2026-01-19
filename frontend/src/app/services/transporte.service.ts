import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransporteService {

  private API = `${environment.apiUrl}/api/transporte`;

  constructor(private http: HttpClient) {}

  /* =========================
     RETIROS (PYME → BODEGA)
     ========================= */

  getRetiros() {
    return this.http.get<any>(`${this.API}/retiros`);
  }

  marcarRetirado(retiroId: number) {
    return this.http.post<any>(
      `${this.API}/retiros/${retiroId}/retirado`,
      {}
    );
  }

  /* =========================
     DESPACHOS (BODEGA → CLIENTE)
     ========================= */

  getDespachos() {
    return this.http.get<any>(`${this.API}/despachos`);
  }

  marcarEnRuta(despachoId: number) {
    return this.http.post<any>(
      `${this.API}/despachos/${despachoId}/en-ruta`,
      {}
    );
  }

  marcarEntregado(despachoId: number, observacion?: string | null) {
    return this.http.post<any>(
      `${this.API}/despachos/${despachoId}/entregar`,
      { observacion }
    );
  }
}
