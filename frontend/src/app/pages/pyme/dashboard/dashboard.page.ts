import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
  IonBadge,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonFab,
  IonFabButton,
} from '@ionic/angular/standalone';

import { ModalController } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  cubeOutline,
  documentTextOutline,
  trendingUpOutline,
  alertCircleOutline,
  addOutline,
  downloadOutline,
  calendarOutline,
  filterOutline,
  searchOutline,
  timeOutline,
  locationOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  navigateCircleOutline,
  imageOutline,
  statsChartOutline,
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
  cantidad_reservada?: number;
  categoria?: string;
  stock_minimo: number;
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
    IonBadge,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonRefresher,
    IonRefresherContent,
    IonSearchbar,
    IonList,
    IonItem
],
})
export class DashboardPage implements OnInit {
  // Datos de la empresa
  empresaNombre = 'Mi Empresa';
  codigoPyme = '—';

  // Métricas
  metrics: DashboardMetrics = {
    productosActivos: 0,
    ordenesActivas: 0,
    volumenOcupado: 0,
    volumenTotal: 0,
    stockBajo: 0,
  };

  // Segmento activo (incluye "ordenes" solo para navegar)
  vistaActiva: 'resumen' | 'inventario' | 'ordenes' = 'resumen';

  // Inventario
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
      trendingUpOutline,
      alertCircleOutline,
      addOutline,
      downloadOutline,
      calendarOutline,
      filterOutline,
      searchOutline,
      timeOutline,
      locationOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      navigateCircleOutline,
      imageOutline,
      statsChartOutline,
      refreshOutline,
      logOutOutline,
    });
  }

  ngOnInit() {
    this.cargarDatosUsuario();
    this.cargarDashboard();
  }

  // ✅ IMPORTANTE: si vuelves al dashboard desde /pyme/orders,
  // que quede en una vista real (no "ordenes")
  ionViewWillEnter() {
    if (this.vistaActiva === 'ordenes') this.vistaActiva = 'resumen';
    this.cargarDatosUsuario();
  }

  // =========================
  // Navegación / Segment
  // =========================
  onSegmentChange(ev: any) {
    const v = ev?.detail?.value as 'resumen' | 'inventario' | 'ordenes';
    if (v === 'ordenes') {
      // evitar pantalla en blanco
      this.vistaActiva = 'resumen';
      this.router.navigateByUrl('/pyme/orders');
      return;
    }
    this.vistaActiva = v;
  }

  irAOrdenes() {
    // también evita que quede seleccionado "ordenes"
    this.vistaActiva = 'resumen';
    this.router.navigateByUrl('/pyme/orders');
  }

  // =========================
  // UserData (localStorage)
  // =========================
  async cargarDatosUsuario() {
  try {
    const res = await fetch('/api/pyme/me', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!res.ok) throw new Error('No se pudo cargar pyme');

    const pyme = await res.json();
    this.empresaNombre = pyme.razon_social;
    this.codigoPyme = pyme.codigo_pyme;

  } catch (e) {
    console.error('Error cargando pyme', e);
    this.empresaNombre = 'Mi Empresa';
    this.codigoPyme = '';
  }
}

  // =========================
  // Cargas
  // =========================
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
    } catch {
      // fallback dev
      this.metrics = {
        productosActivos: 0,
        ordenesActivas: 0,
        volumenOcupado: 0,
        volumenTotal: 0,
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
      this.productos = Array.isArray(data) ? data : [];
      this.productosFiltrados = [...this.productos];
      this.filtrarProductos();
    } catch {
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
    this.productosFiltrados = this.productos.filter((p) =>
      (p.nombre || '').toLowerCase().includes(term) ||
      ((p.sku || '').toLowerCase().includes(term))
    );
  }

  // =========================
  // Modal Crear Producto
  // =========================
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

  // =========================
  // UI helpers
  // =========================
  get porcentajeVolumen(): number {
    if (!this.metrics.volumenTotal) return 0;
    return (this.metrics.volumenOcupado / this.metrics.volumenTotal) * 100;
  }

  getColorVolumen(): string {
    const p = this.porcentajeVolumen;
    if (p < 70) return 'success';
    if (p < 90) return 'warning';
    return 'danger';
  }

  // =========================
  // Refresh / Logout
  // =========================
  async refrescarDatos(event?: any) {
    await this.cargarDashboard();
    if (event) event.target.complete();
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}

