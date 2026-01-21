import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonList,
  IonSelect,
  IonSelectOption,
  IonIcon
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';

import { RetiroService } from '../../../../../services/retiro.service';
import { ProductService, Product } from '../../../../../services/product.service';
import { ModalController } from '@ionic/angular';
import { ProductoModalComponent } from '../../../../../components/producto-modal.component';

type Rango = 'CORTE_1' | 'CORTE_2';

@Component({
  selector: 'app-crear-retiro',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonList,
    IonSelect,
    IonSelectOption,
    IonIcon
  ],
  templateUrl: './crear-retiro.page.html',
  styleUrls: ['./crear-retiro.page.scss']
})
export class CrearRetiroPage {
  comuna = '';
  direccion = '';
  rango: Rango | null = null;

  // búsqueda de productos
  search = '';
  productos: Product[] = [];
  productosFiltrados: Product[] = [];

  // items del retiro
  items: Array<{ producto_id: number; nombre: string; cantidad: number }> = [];

  loading = false;
  errorMsg = '';

  constructor(
    private retiroService: RetiroService,
    private productService: ProductService,
    private modalCtrl: ModalController,
    private router: Router
  ) {}

  // 🔎 Buscar productos
  buscarProductos() {
    if (!this.search.trim()) {
      this.productosFiltrados = [];
      return;
    }

    this.productService
  .getProducts()
  .subscribe((prods) => {
    const term = this.search.toLowerCase();

    this.productos = prods;
    this.productosFiltrados = prods.filter((p: Product) =>
      p.nombre.toLowerCase().includes(term) ||
      (p.sku && p.sku.toLowerCase().includes(term)) ||
      (p.codigo_barras && p.codigo_barras.toLowerCase().includes(term))
    );
  });

  }

  // agregar producto a la orden
  agregarProducto(p: Product) {
    const existe = this.items.find(i => i.producto_id === p.id);
    if (existe) {
      existe.cantidad += 1;
    } else {
      this.items.push({
        producto_id: p.id,
        nombre: p.nombre,
        cantidad: 1
      });
    }
  }

  quitarProducto(i: number) {
    this.items.splice(i, 1);
  }

  // crear producto desde modal
  async abrirModalCrearProducto() {
    const modal = await this.modalCtrl.create({
      component: ProductoModalComponent
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();

    if (data?.created) {
      this.search = data.created.nombre;
      this.buscarProductos();
    }
  }

  // 🚚 enviar retiro
  crearRetiro() {
    this.errorMsg = '';

    if (!this.comuna || !this.direccion || !this.rango) {
      this.errorMsg = 'Completa los datos obligatorios';
      return;
    }

    if (this.items.length === 0) {
      this.errorMsg = 'Agrega al menos un producto';
      return;
    }

    this.loading = true;

    this.retiroService.crearRetiro({
      comuna: this.comuna,
      direccion: this.direccion,
      rango: this.rango,
      items: this.items.map(i => ({
        producto_id: i.producto_id,
        cantidad: i.cantidad
      }))
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/pyme/orders');
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Error al crear retiro';
      }
    });
  }
}



