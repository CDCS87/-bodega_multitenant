// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'; // Asegúrate de tener tu URL base aquí

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/api/admin/usuarios`;

  constructor(private http: HttpClient) { }

  // Este método enviará el objeto completo (User + Pyme/Transp)
  crearUsuarioCompleto(userData: any) {
  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}` };
  return this.http.post(`${environment.apiUrl}/api/admin/usuarios`, userData, { headers });
}

  // Métodos extra para el administrador
  getUsuarios() {
    return this.http.get<any[]>(this.apiUrl);
  }

  eliminarUsuario(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  actualizarUsuario(id: number, userData: any) {
    return this.http.put(`${this.apiUrl}/${id}`, userData);
  }

  getZonas() {
    // Esto limpia cualquier barra doble o faltante automáticamente
    const url = `${environment.apiUrl.replace(/\/$/, '')}/api/admin/zonas`;
    return this.http.get<any[]>(url);
}
}