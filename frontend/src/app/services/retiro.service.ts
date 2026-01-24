import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RetiroService {
  
  // 🔴 AQUÍ ESTÁ LA CLAVE: Forzamos la ruta completa con /api
  private baseUrl = 'http://localhost:3000/api/retiros';

  constructor(private http: HttpClient) { }

  // 1. CREAR RETIRO
  // Esto generará: http://localhost:3000/api/retiros/crear
  crearRetiro(data: any): Observable<any> {
    console.log('📡 Enviando a:', `${this.baseUrl}/crear`); // Chivato para consola
    return this.http.post(`${this.baseUrl}/crear`, data);
  }

  // 2. OBTENER HISTORIAL
  // Esto generará: http://localhost:3000/api/retiros/mis-retiros
  getMyRetiros(): Observable<any> {
    return this.http.get(`${this.baseUrl}/mis-retiros`);
  }

  // 3. OBTENER DETALLE (Por ID)
  // Esto generará: http://localhost:3000/api/retiros/123
  getRetiroById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  // 4. BUSCAR POR CÓDIGO (Bodega)
  buscarPorCodigo(codigo: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/scan/${encodeURIComponent(codigo)}`);
  }

  // 5. CONFIRMAR RECEPCIÓN (Bodega)
  confirmarRecepcion(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/recepcionar-final`, payload);
  }
}



