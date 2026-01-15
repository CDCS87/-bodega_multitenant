import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonList } from '@ionic/angular/standalone';
import { Product, ProductService } from '../../../../services/product.service';

type KV = { key: string; value: string };

@Component({
  selector: 'app-crear-producto-modal',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonItem, IonLabel, IonInput, IonButton, IonList
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Crear Producto</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label position="stacked">Nombre</ion-label>
        <ion-input [(ngModel)]="nombre"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">SKU (opcional)</ion-label>
        <ion-input [(ngModel)]="sku"></ion-input>
      </ion-item>

      <h3 style="margin-top:16px;">Descripción (JSONB)</h3>
      <ion-list>
        <ion-item *ngFor="let row of kv; let i=index">
          <ion-input placeholder="clave" [(ngModel)]="row.key" style="max-width:40%;"></ion-input>
          <ion-input placeholder="valor" [(ngModel)]="row.value"></ion-input>
          <ion-button fill="clear" color="danger" (click)="removeKV(i)">Quitar</ion-button>
        </ion-item>
      </ion-list>

      <ion-button expand="block" fill="outline" (click)="addKV()">+ Agregar campo</ion-button>

      <div style="display:flex; gap:8px; margin-top:16px;">
        <ion-button expand="block" fill="outline" (click)="close()">Cancelar</ion-button>
        <ion-button expand="block" [disabled]="saving || !nombre.trim()" (click)="save()">Guardar</ion-button>
      </div>
    </ion-content>
  `
})
export class CrearProductoModalComponent {
  nombre = '';
  sku = '';
  kv: KV[] = [{ key: '', value: '' }];
  saving = false;

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
    this.modalCtrl.dismiss();
  }

  private buildDescripcion(): Record<string, any> {
    const obj: Record<string, any> = {};
    for (const row of this.kv) {
      const k = row.key?.trim();
      if (!k) continue;
      obj[k] = row.value;
    }
    return obj;
  }

  save() {
    this.saving = true;

    const payload: any = {
      nombre: this.nombre.trim(),
      descripcion: this.buildDescripcion()
    };

    // sku opcional: si backend no lo usa, lo ignorará o lo ajustamos después
    if (this.sku.trim()) payload.sku = this.sku.trim();

    this.productService.createProduct(payload).subscribe({
      next: (created: Product) => {
        this.saving = false;
        this.modalCtrl.dismiss({ created });
      },
      error: () => {
        this.saving = false;
      }
    });
  }
}
