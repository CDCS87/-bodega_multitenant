import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
  IonSearchbar, IonList, IonItem, IonLabel, IonInput, IonText
} from '@ionic/angular/standalone';

import { Product, ProductService } from '../../../../services/product.service';
import {ProductoModalComponent } from '../../../../components/producto-modal.component';

type DraftItem = { productId: number; sku: string; nombre: string; cantidad: number; };

@Component({
  selector: 'app-crear-retiro',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
    IonSearchbar, IonList, IonItem, IonLabel, IonInput, IonText
  ],
  templateUrl: './crear-retiro.page.html',
  styleUrls: ['./crear-retiro.page.scss'],
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

  ngOnInit(): void {
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
      component: ProductoModalComponent
    });

    await modal.present();
    const { data } = await modal.onWillDismiss<{ created?: Product }>();

    if (data?.created) {
      // Lo metemos arriba y lo dejamos seleccionable inmediatamente
      this.products = [data.created, ...this.products];
      this.applyFilter();
      this.addItem(data.created);
    }
  }

  saveDraft() {
    // Por ahora: draft local. Luego será POST /api/pickups
    const draft = {
      createdAt: new Date().toISOString(),
      items: this.items
    };
    localStorage.setItem('pyme_pickup_draft', JSON.stringify(draft));
    this.router.navigate(['/pyme/retiros'], { replaceUrl: true });
  }

  cancel() {
    this.router.navigate(['/pyme/retiros'], { replaceUrl: true });
  }
}

