import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
  IonSearchbar, IonList, IonItem, IonLabel, IonInput, IonText
} from '@ionic/angular/standalone';
import { Product, ProductService } from '../../../services/product.service';
import { CrearProductoModalComponent } from '../components/crear-producto-modal/crear-producto-modal.component';

type DraftItem = { productId: number; sku: string; nombre: string; cantidad: number; };

@Component({
  selector: 'app-crear-retiro',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
    IonSearchbar, IonList, IonItem, IonLabel, IonInput, IonText
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Crear Retiro</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div style="display:flex; gap:8px; align-items:center;">
        <ion-searchbar
          placeholder="Buscar producto por nombre o SKU"
          [(ngModel)]="q"
          (ionInput)="applyFilter()"
          style="flex:1;"
        ></ion-searchbar>

        <ion-button (click)="openCreateProduct()">+ Crear</ion-button>
      </div>

      <ion-text *ngIf="loading">Cargando productos...</ion-text>

      <ion-list *ngIf="!loading">
        <ion-item *ngFor="let p of filtered" button (click)="addItem(p)">
          <ion-label>
            <h2>{{ p.nombre }}</h2>
            <p>SKU: {{ p.sku }}</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <div style="margin-top:16px;">
        <h3>Productos a enviar</h3>

        <ion-text *ngIf="items.length === 0">
          Aún no agregas productos.
        </ion-text>

        <ion-list>
          <ion-item *ngFor="let it of items; let i = index">
            <ion-label>
              <h2>{{ it.nombre }}</h2>
              <p>{{ it.sku }}</p>
            </ion-label>

            <ion-input
              type="number"
              inputmode="numeric"
              min="1"
              [(ngModel)]="it.cantidad"
              placeholder="Cantidad"
              style="max-width:110px;"
            ></ion-input>

            <ion-button fill="clear" color="danger" (click)="remove(i)">Quitar</ion-button>
          </ion-item>
        </ion-list>

        <ion-button expand="block" [disabled]="!canSave()" (click)="saveDraft()">
          Guardar retiro (draft)
        </ion-button>
      </div>
    </ion-content>
  `
})
export class CrearRetiroPage implements OnInit {
  q = '';
  loading = false;

  products: Product[] = [];
  filtered: Product[] = [];

  items: DraftItem[] = [];

  constructor(
    private productService: ProductService,
    private modalCtrl: ModalController,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  private loadProducts() {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (prods) => {
        this.products = prods;
        this.filtered = prods;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  applyFilter() {
    const term = this.q.trim().toLowerCase();
    if (!term) {
      this.filtered = this.products;
      return;
    }
    this.filtered = this.products.filter(p =>
      (p.nombre || '').toLowerCase().includes(term) ||
      (p.sku || '').toLowerCase().includes(term)
    );
  }

  addItem(p: Product) {
    const existing = this.items.find(it => it.productId === p.id);
    if (existing) {
      existing.cantidad += 1;
    } else {
      this.items.push({ productId: p.id, sku: p.sku, nombre: p.nombre, cantidad: 1 });
    }
  }

  remove(index: number) {
    this.items.splice(index, 1);
  }

  canSave(): boolean {
    if (this.items.length === 0) return false;
    return this.items.every(it => Number(it.cantidad) > 0);
  }

  async openCreateProduct() {
    const modal = await this.modalCtrl.create({
      component: CrearProductoModalComponent
    });

    await modal.present();
    const { data } = await modal.onWillDismiss<{ created?: Product }>();

    if (data?.created) {
      // agregar al catálogo local y seleccionar automáticamente
      this.products = [data.created, ...this.products];
      this.applyFilter();
      this.addItem(data.created);
    }
  }

  saveDraft() {
    // por ahora solo guardamos draft local (más adelante POST /api/pickups)
    const draft = {
      createdAt: new Date().toISOString(),
      items: this.items
    };
    localStorage.setItem('pyme_pickup_draft', JSON.stringify(draft));
    this.router.navigate(['/pyme/retiros'], { replaceUrl: true });
  }
}
