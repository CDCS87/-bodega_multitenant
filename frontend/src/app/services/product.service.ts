import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  pyme_id: number;
  sku: string;
  nombre: string;
  descripcion: string | null;
  codigo_barras: string | null;
  tiene_codigo_original: boolean;
  caracteristicas_especificas: Record<string, any> | null;
  cantidad_disponible: number;
  cantidad_reservada: number;
  unidad_medida: string | null;
  fecha_vencimiento: string | null;
  lote: string | null;
  alerta_stock_bajo: number | null;
  activo: boolean;
  ubicacion_id: number | null;
  fecha_registro?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly API_URL = 'http://localhost:3000/api/products';
  constructor(private http: HttpClient) {}

  getProducts() {
    return this.http.get<any>(this.API_URL).pipe(map(r => r.productos ?? []));
  }

  createProduct(payload: {
    nombre: string;
    descripcion?: string | null;
    caracteristicas_especificas?: Record<string, any> | null;
    unidad_medida?: string | null;
    alerta_stock_bajo?: number | null;
    sku?: string;
    tiene_codigo_original?: boolean;
    codigo_barras?: string | null;
  }) {
    return this.http.post<any>(this.API_URL, payload).pipe(map(r => r.producto));
  }
}




