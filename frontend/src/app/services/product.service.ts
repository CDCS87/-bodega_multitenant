import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private readonly apiUrl = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los productos de la PYME autenticada
   */
  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
