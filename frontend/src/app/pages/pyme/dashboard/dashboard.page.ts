import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonButton,
  IonButtons,
  IonMenuButton,
  IonGrid,
  IonRow,
  IonCol,
  IonProgressBar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonBadge, IonText } from '@ionic/angular/standalone';

import { ModalController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

import { addIcons } from 'ionicons';
import {
  cubeOutline,
  documentTextOutline,
  addOutline,
  refreshOutline,
  logOutOutline,
} from 'ionicons/icons';

import { ProductService } from '../../../services/product.service';
import { ProductoModalComponent } from '../../../components/producto-modal.component';

interface DashboardMetrics {
  productosActivos: number;
  ordenesActivas: number;
  volumenOcupado: number;
  volumenTotal: number;
  stockBajo: number;
}

interface Producto {
  id: number;
  sku?: string;
  nombre: string;
  cantidad_disponible: number;
  stock_minimo: number;
  categoria?: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonIcon,
    IonButton,
    IonButtons,
    IonMenuButton,
    IonGrid,
    IonRow,
    IonCol,
    IonProgressBar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonRefresher,
    IonRefresherContent,
    IonSearchbar,
    IonList,
    IonItem,
    IonBadge
],
})
export class DashboardPage implements OnInit {
  empresaNombre = 'Mi Empresa';
  codigoPyme = '—';

  vistaActiva: 'resumen' | 'inventario' | 'ordenes' = 'resumen';

  metrics: DashboardMetrics = {
    productosActivos: 0,
    ordenesActivas: 0,
    volumenOcupado: 0,
    volumenTotal: 0,
    stockBajo: 0,
  };

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  searchTerm = '';

  constructor(
    private productService: ProductService,
    private router: Router,
    private modalCtrl: ModalController
  ) {
    addIcons({
      cubeOutline,
      documentTextOutline,
      addOutline,
      refreshOutline,
      logOutOutline,
    });
  }

  ngOnInit() {
    this.cargarDatosUsuario();
    this.cargarDashboard();
  }

  ionViewWillEnter() {
    // por si el userData se setea después del login
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario() {
    const raw = localStorage.getItem('userData');
    if (!raw) return;

    const u = JSON.parse(raw);

    this.empresaNombre =
      u.empresa_nombre ??
      u.razon_social ??
      u.empresaNombre ??
      this.empresaNombre;

    this.codigoPyme =
      u.codigo_pyme ??
      u.codigoPyme ??
      u.pyme_codigo ??
      this.codigoPyme;
  }

  async cargarDashboard() {
    await Promise.all([this.cargarMetricas(), this.cargarProductos()]);
  }

  async cargarMetricas() {
    try {
      const response = await fetch('/api/pyme/dashboard/metrics', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      this.metrics = data;
    } catch (e) {
      // fallback dev
      this.metrics = {
        productosActivos: this.productos.length || 0,
        ordenesActivas: 0,
        volumenOcupado: 0,
        volumenTotal: 1,
        stockBajo: 0,
      };
    }
  }

  async cargarProductos() {
    try {
      const response = await fetch('/api/pyme/productos', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();

      this.productos = data || [];
      this.productosFiltrados = [...this.productos];

      // recalcula métricas simples si quieres
      this.metrics.productosActivos = this.productos.length;
      this.metrics.stockBajo = this.productos.filter(
        (p) => (p.cantidad_disponible ?? 0) <= (p.stock_minimo ?? 0)
      ).length;
    } catch (e) {
      this.productos = [];
      this.productosFiltrados = [];
    }
  }

  filtrarProductos() {
    const term = (this.searchTerm || '').trim().toLowerCase();
    if (!term) {
      this.productosFiltrados = [...this.productos];
      return;
    }
    this.productosFiltrados = this.productos.filter((p) => {
      const n = (p.nombre ?? '').toLowerCase();
      const sku = (p.sku ?? '').toLowerCase();
      return n.includes(term) || sku.includes(term);
    });
  }

  get porcentajeVolumen(): number {
    const total = this.metrics.volumenTotal || 1;
    return (this.metrics.volumenOcupado / total) * 100;
  }

  getColorVolumen(): string {
    const p = this.porcentajeVolumen;
    if (p < 70) return 'success';
    if (p < 90) return 'warning';
    return 'danger';
  }

  async refrescarDatos(event?: any) {
    await this.cargarDashboard();
    if (event) event.target.complete();
  }

  irAOrdenes() {
    this.router.navigateByUrl('/pyme/orders.page');
  }

  async abrirModalCrearProducto() {
    const modal = await this.modalCtrl.create({
      component: ProductoModalComponent,
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.created) {
      await this.cargarProductos();
      this.vistaActiva = 'inventario';
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}

