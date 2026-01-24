import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RetiroService {
  
  apiUrl = environment.apiUrl; // http://localhost:3000/api

  constructor(http) {
    this.http = http;
  }

  // 1. CREAR RETIRO (PYME)
  crearRetiro(data) {
    const baseUrl = this.apiUrl.includes('/api') ? this.apiUrl : `${this.apiUrl}/api`;
  return this.http.post<any>(`${baseUrl}/retiros/crear`, data);
  }

  // 2. OBTENER MIS RETIROS - Historial (PYME)
  getMyRetiros() {
    return this.http.get(`${this.apiUrl}/retiros/mis-retiros`);
  }

  // 3. BUSCAR POR CÓDIGO (PYME/BODEGA)
  buscarPorCodigo(codigo) {
    return this.http.get(`${this.apiUrl}/retiros/scan/${encodeURIComponent(codigo)}`);
  }

  // 4. OBTENER PENDIENTES DE BODEGA (BODEGA)
  getPendientesBodega() {
    // Este endpoint aún no existe en tu backend, pero lo agregamos para que compile
    return this.http.get(`${this.apiUrl}/retiros/pendientes`);
  }

  // 5. ESCANEAR/RECEPCIONAR RETIRO (BODEGA)
  scanRetiro(codigo) {
    return this.http.post(`${this.apiUrl}/retiros/recepcionar`, { codigo });
  }
}



