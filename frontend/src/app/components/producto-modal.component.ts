import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone'; // ✅ AQUÍ

import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonLabel, IonInput, IonButton, IonList, IonText
} from '@ionic/angular/standalone';

import { Product, ProductService } from '../services/product.service';

type KV = { key: string; value: string };

@Component({
  selector: 'app-producto-modal',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonItem, IonLabel, IonInput, IonButton, IonList, IonText
  ],
  templateUrl: './producto-modal.component.html',
  styleUrls: ['./producto-modal.component.scss'],
})
export class ProductoModalComponent {
  nombre = '';
  sku = '';
  descripcionTexto = '';

  kv: KV[] = [{ key: '', value: '' }];

  saving = false;
  errorMsg = '';

  constructor(
    private modalCtrl: ModalController,
    private productService: ProductService
  ) {}

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
    if (this.sku.trim() && this.sku.trim().length < 3) {
      return { ok: false, message: 'El SKU debe tener al menos 3 caracteres (o déjalo vacío).' };
    }
    try { this.buildCaracteristicas(); } catch (e: any) {
      return { ok: false, message: e?.message || 'Error en características.' };
    }
    return { ok: true };
  }

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
      this.errorMsg = e?.message || 'Error en características.';
      return;
    }

    const payload: any = {
      nombre: this.nombre.trim(),
      descripcion: this.descripcionTexto.trim() ? this.descripcionTexto.trim() : null,
      caracteristicas_especificas: caracteristicas,
    };

    if (this.sku.trim()) payload.sku = this.sku.trim();

    this.productService.createProduct(payload).subscribe({
      next: (created: Product) => {
        this.saving = false;
        this.modalCtrl.dismiss({ created });
      },
      error: (err) => {
        this.saving = false;
        this.errorMsg = err?.error?.message || 'No se pudo crear el producto';
      }
    });
  }
}


