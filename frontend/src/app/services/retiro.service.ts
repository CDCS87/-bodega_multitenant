import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

export type RetiroItemCreate = {
  producto_id: number;
  cantidad_esperada: number;
  observaciones?: string | null;
};

export type RetiroCreatePayload = {
  direccion_retiro: string;
  comuna: string;
  fecha_solicitada: string;
  observaciones?: string | null;
  items: RetiroItemCreate[];
};

@Injectable({ providedIn: 'root' })
export class RetiroService {
  private readonly API_URL = 'http://localhost:3000/api/retiros';
  constructor(private http: HttpClient) {}

  createRetiro(payload: RetiroCreatePayload) {
    return this.http.post<any>(this.API_URL, payload).pipe(map(r => r.orden));
  }

  getRetiros(filters?: { estado?: string; desde?: string; hasta?: string; q?: string }) {
    let params = new HttpParams();
    if (filters?.estado) params = params.set('estado', filters.estado);
    if (filters?.desde) params = params.set('desde', filters.desde);
    if (filters?.hasta) params = params.set('hasta', filters.hasta);
    if (filters?.q) params = params.set('q', filters.q);

    return this.http.get<any>(this.API_URL, { params }).pipe(map(r => r.ordenes ?? r.retiros ?? r.data ?? []));
  }

  getRetiroById(id: number) {
    return this.http.get<any>(`${this.API_URL}/${id}`).pipe(map(r => r.orden));
  }

  scanRetiro(codigo: string) {
  return this.http
    .get<any>(`${this.API_URL}/scan/${encodeURIComponent(codigo)}`)
    .pipe(map(r => r.orden));
}

getPendientesBodega() {
  // para rol BODEGA tu backend devuelve estado RETIRADO
  return this.http.get<any>(this.API_URL).pipe(map(r => r.ordenes));
}

confirmarIngresoBodega(
  id: number,
  items: { detalle_id: number; cantidad_recibida: number }[],
  fotos: File[] = []
) {
  const form = new FormData();
  form.append('items', JSON.stringify(items));
  fotos.forEach(f => form.append('fotos', f));
  return this.http.put<any>(`${this.API_URL}/${id}/ingresar`, form);
}

}


