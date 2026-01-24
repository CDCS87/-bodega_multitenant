import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RetiroService {
  
  private apiUrl = environment.apiUrl; 

  constructor(private http: HttpClient) { }

  // 1. CREAR RETIRO
  // Corrección: Aquí nos aseguramos de poner '/retiros' solo una vez
  crearRetiro(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/retiros/crear`, data);
  }

  // 2. OBTENER MIS RETIROS (Historial)
  getMyRetiros(): Observable<any> {
    return this.http.get(`${this.apiUrl}/retiros/mis-retiros`);
  }
}



