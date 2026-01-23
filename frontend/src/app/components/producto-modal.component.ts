import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonLabel, IonInput, IonButton, IonList, IonText, IonSpinner 
} from '@ionic/angular/standalone';

// ✅ Volvemos a usar tu Servicio (Ya no necesitamos AuthService aquí)
import { ProductService } from '../services/product.service';

type KV = { key: string; value: string };

@Component({
  selector: 'app-producto-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonGrid, IonRow, IonCol,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonItem, IonLabel, IonInput, IonButton, IonList, IonText
],
  templateUrl: './producto-modal.component.html',
  styleUrls: ['./producto-modal.component.scss'],
})
export class ProductoModalComponent {
  nombre = '';
  codigoBarras = '';
  sku = '';
  descripcionTexto = '';
  kv: KV[] = [{ key: '', value: '' }];

  saving = false;
  errorMsg = '';

  constructor(
    private modalCtrl: ModalController,
    private productService: ProductService // 
  ) {}


  addKV() { this.kv.push({ key: '', value: '' }); }
  removeKV(i: number) { this.kv.splice(i, 1); if (this.kv.length === 0) this.kv.push({ key: '', value: '' }); }
  close() { if (this.saving) return; this.modalCtrl.dismiss(); }

  private buildCaracteristicas(): Record<string, any> | null {
    const obj: Record<string, any> = {};
    const usedKeys = new Set<string>();
    for (const row of this.kv) {
      const k = (row.key ?? '').trim();
      const v = (row.value ?? '').trim();
      if (!k) continue;
      const keyLower = k.toLowerCase();
      if (usedKeys.has(keyLower)) throw new Error(`Clave duplicada: ${k}`);
      usedKeys.add(keyLower);
      obj[k] = v;
    }
    return Object.keys(obj).length ? obj : null;
  }

  private validate(): { ok: boolean; message?: string } {
    if (!this.nombre.trim()) return { ok: false, message: 'El nombre es obligatorio.' };
    const cb = this.codigoBarras.trim();
    const sku = this.sku.trim();
    if (cb && cb.length < 3) return { ok: false, message: 'Código de barras muy corto.' };
    if (sku && sku.length < 3) return { ok: false, message: 'SKU muy corto.' };
    try { this.buildCaracteristicas(); } catch (e: any) { return { ok: false, message: e.message }; }
    return { ok: true };
  }

  // --- LÓGICA DE GUARDADO LIMPIA ---
  save() {
    if (this.saving) return;

    this.errorMsg = '';
    const v = this.validate();
    if (!v.ok) {
      this.errorMsg = v.message || 'Revisa los datos.';
      return;
    }

    this.saving = true;

    let caracteristicas: Record<string, any> | null = null;
    try {
      caracteristicas = this.buildCaracteristicas();
    } catch (e: any) {
      this.saving = false;
      this.errorMsg = e?.message;
      return;
    }

    const payload: any = {
      nombre: this.nombre.trim(),
      descripcion: this.descripcionTexto.trim() || null,
      caracteristicas_especificas: caracteristicas,
      // Valores por defecto
      stock_minimo: 5,
      cantidad_disponible: 0 
    };

    if (this.codigoBarras.trim()) payload.codigo_barras = this.codigoBarras.trim();
    if (this.sku.trim()) payload.sku = this.sku.trim();

    //  Token para crear el producto
    this.productService.createProduct(payload).subscribe({
      next: (created) => {
        this.saving = false;
        this.modalCtrl.dismiss({ created });
      },
      error: (err) => {
        console.error(err);
        this.saving = false;
        // El interceptor muestra errores de validación del backend
        this.errorMsg = err.error?.message || 'Error al guardar el producto';
      }
    });
  }
}

