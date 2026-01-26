import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; 
@Injectable({
  providedIn: 'root'
})
export class RetiroService {
  

  private baseUrl = `${environment.apiUrl}/api/retiros`; 

  constructor(private http: HttpClient) { }

  // 1. CREAR RETIRO
  crearRetiro(data: any): Observable<any> {
    console.log('📡 Enviando petición a:', `${this.baseUrl}/crear`); 
    return this.http.post(`${this.baseUrl}/crear`, data);
  }

  // 2. OBTENER HISTORIAL
  getMyRetiros(): Observable<any> {
    return this.http.get(`${this.baseUrl}/mis-retiros`);
  }

  // 3. OBTENER DETALLE (Por ID)
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



