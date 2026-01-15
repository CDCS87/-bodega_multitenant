import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  sku: string;
  nombre: string;
  descripcion?: Record<string, any> | null; // JSONB según informe
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly API_URL = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<any>(this.API_URL).pipe(map(r => r.productos ?? []));
  }

  createProduct(payload: { nombre: string; sku?: string; descripcion?: Record<string, any> }): Observable<Product> {
    return this.http.post<any>(this.API_URL, payload).pipe(map(r => r.producto));
  }
}

