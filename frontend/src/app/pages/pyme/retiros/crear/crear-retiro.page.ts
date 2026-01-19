import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonLabel, IonInput, IonButton,
  IonList, IonText, IonSelect, IonSelectOption, IonSpinner
} from '@ionic/angular/standalone';
import { Product, ProductService } from '../../../../services/product.service';
import { RetiroService } from '../../../../services/retiro.service';
import { ProductoModalComponent } from '../../../../components/producto-modal.component';

type SelectedItem = {
  producto: Product;
  cantidad_esperada: number;
  observaciones?: string;
};
@Component({
  selector: 'app-crear-retiro',
  standalone: true,
 imports: [
  CommonModule, FormsModule,
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonLabel, IonInput, IonButton,
  IonList, IonText, IonSelect, IonSelectOption, IonSpinner
],
  templateUrl: './crear-retiro.page.html',
  styleUrls: ['./crear-retiro.page.scss'],
})
export class CrearRetiroPage implements OnInit {

  // Cabecera retiro
  direccion_retiro = '';
  comuna = '';
  fecha_solicitada = this.todayISO();
  observaciones = '';

  // Productos
  products: Product[] = [];
  loadingProducts = false;

  selectedProductId: number | null = null;

  items: SelectedItem[] = [];

  saving = false;
  errorMsg = '';

  constructor(
    private productService: ProductService,
    private retiroService: RetiroService,
    private modalCtrl: ModalController,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  private todayISO(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  loadProducts() {
    this.loadingProducts = true;
    this.productService.getProducts().subscribe({
      next: (list: Product[]) => {
        this.products = list.filter(p => p.activo !== false);
        this.loadingProducts = false;
      },
      error: (err) => {
        this.loadingProducts = false;
        this.errorMsg = err?.error?.message || 'No se pudieron cargar los productos';
      }
    });
  }

  addSelectedProduct() {
    this.errorMsg = '';

    if (!this.selectedProductId) {
      this.errorMsg = 'Selecciona un producto para agregarlo.';
      return;
    }

    const producto = this.products.find(p => p.id === this.selectedProductId);
    if (!producto) {
      this.errorMsg = 'Producto no encontrado.';
      return;
    }

    const exists = this.items.some(it => it.producto.id === producto.id);
    if (exists) {
      this.errorMsg = 'Este producto ya fue agregado.';
      return;
    }

    this.items.push({
      producto,
      cantidad_esperada: 1,
      observaciones: ''
    });

    this.selectedProductId = null;
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
  }

  async openCreateProductModal() {
    this.errorMsg = '';

    const modal = await this.modalCtrl.create({
      component: ProductoModalComponent
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();

    if (data?.created) {
      // Insertamos el nuevo producto y lo dejamos seleccionado para agregarlo
      this.products = [data.created, ...this.products];
      this.selectedProductId = data.created.id;
    }
  }

  private validate(): { ok: boolean; message?: string } {
    if (!this.direccion_retiro.trim()) return { ok: false, message: 'Dirección de retiro es obligatoria.' };
    if (!this.comuna.trim()) return { ok: false, message: 'Comuna es obligatoria.' };
    if (!this.fecha_solicitada) return { ok: false, message: 'Fecha solicitada es obligatoria.' };
    if (this.items.length === 0) return { ok: false, message: 'Agrega al menos 1 producto con cantidad.' };

    for (const it of this.items) {
      if (!Number.isInteger(it.cantidad_esperada) || it.cantidad_esperada <= 0) {
        return { ok: false, message: `Cantidad inválida para "${it.producto.nombre}".` };
      }
    }
    return { ok: true };
  }

  submit() {
    if (this.saving) return;

    this.errorMsg = '';
    const v = this.validate();
    if (!v.ok) {
      this.errorMsg = v.message || 'Revisa los datos.';
      return;
    }

    this.saving = true;

    const payload = {
      direccion_retiro: this.direccion_retiro.trim(),
      comuna: this.comuna.trim(),
      fecha_solicitada: this.fecha_solicitada,
      observaciones: this.observaciones.trim() ? this.observaciones.trim() : null,
      items: this.items.map(it => ({
        producto_id: it.producto.id,
        cantidad_esperada: it.cantidad_esperada,
        observaciones: it.observaciones?.trim() ? it.observaciones.trim() : null
      }))
    };

    this.retiroService.createRetiro(payload).subscribe({
      next: (orden) => {
        this.saving = false;
        // Redirige a listado o a detalle (cuando exista)
        // Por ahora al listado:
        this.router.navigate(['/pyme/retiros'], { replaceUrl: true });
      },
      error: (err) => {
        this.saving = false;
        this.errorMsg = err?.error?.message || 'No se pudo crear la orden de retiro';
      }
    });
  }
}

