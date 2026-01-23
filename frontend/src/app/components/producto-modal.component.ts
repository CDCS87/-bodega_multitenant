import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonLabel, IonInput, IonButton, IonList, IonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, alertCircleOutline } from 'ionicons/icons';

// Importamos AuthService y Environment
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

//  ProductService usa fetch directo
// import { Product, ProductService } from '../services/product.service';

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
    private authService: AuthService 
  ) {
    addIcons({ closeOutline, alertCircleOutline });
  }

  addKV() {
    this.kv.push({ key: '', value: '' });
  }

  removeKV(i: number) {
    this.kv.splice(i, 1);
    if (this.kv.length === 0) this.kv.push({ key: '', value: '' });
  }

  close() {
    if (this.saving) return;
    this.modalCtrl.dismiss();
  }

  private buildCaracteristicas(): Record<string, any> | null {
    const obj: Record<string, any> = {};
    const usedKeys = new Set<string>();

    for (const row of this.kv) {
      const k = (row.key ?? '').trim();
      const v = (row.value ?? '').trim();
      if (!k) continue;

      const keyLower = k.toLowerCase();
      if (usedKeys.has(keyLower)) throw new Error(`La clave "${k}" está duplicada.`);
      usedKeys.add(keyLower);

      obj[k] = v;
    }

    return Object.keys(obj).length ? obj : null;
  }

  private validate(): { ok: boolean; message?: string } {
    if (!this.nombre.trim()) return { ok: false, message: 'El nombre es obligatorio.' };
    const cb = this.codigoBarras.trim();
    const sku = this.sku.trim();

    if (cb && cb.length < 3) {
      return { ok: false, message: 'El código de barras es muy corto.' };
    }

    if (sku && sku.length < 3) {
      return { ok: false, message: 'El SKU debe tener al menos 3 caracteres.' };
    }

    try { this.buildCaracteristicas(); } catch (e: any) {
      return { ok: false, message: e?.message || 'Error en características.' };
    }
    return { ok: true };
  }

  async save() {
    if (this.saving) return;

    this.errorMsg = '';
    const v = this.validate();
    if (!v.ok) {
      this.errorMsg = v.message || 'Revisa los datos.';
      return;
    }

    this.saving = true;

    //  Payload
    let caracteristicas: Record<string, any> | null = null;
    try {
      caracteristicas = this.buildCaracteristicas();
    } catch (e: any) {
      this.saving = false;
      this.errorMsg = e?.message || 'Error en características.';
      return;
    }

    const payload: any = {
      nombre: this.nombre.trim(),
      descripcion: this.descripcionTexto.trim() || null,
      caracteristicas_especificas: caracteristicas,
      // Datos por defecto para el backend actual
      cantidad_disponible: 0, 
      stock_minimo: 5 
    };

    if (this.codigoBarras.trim()) payload.codigo_barras = this.codigoBarras.trim();
    if (this.sku.trim()) payload.sku = this.sku.trim();

    try {
      // 2. Obtener Token del AuthService
      const token = this.authService.getAccessToken(); 

      if (!token) {
        throw new Error('Sesión no válida. Inicia sesión de nuevo.');
      }

      // 3. Enviar con Fetch (bypass de problemas de Interceptor)
      //  ruta '/api/pyme/productos'
      const response = await fetch(`${environment.apiUrl}/api/pyme/productos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Header de Auth
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar en el servidor');
      }

      // 4. Éxito
      this.saving = false;
      this.modalCtrl.dismiss({ created: data.product || data });

    } catch (error: any) {
      console.error(error);
      this.saving = false;
      this.errorMsg = error.message || 'No se pudo crear el producto';
    }
  }
}


