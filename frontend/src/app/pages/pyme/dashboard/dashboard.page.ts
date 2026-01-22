import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
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
// Importamos el servicio de autenticación
import { AuthService } from '../../../services/auth.service';

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

  // Segmento activo
  vistaActiva: 'resumen' | 'inventario' | 'ordenes' = 'resumen';

  // Inventario
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  searchTerm = '';

  constructor(
    private productService: ProductService,
    private authService: AuthService, // ✅ Inyectamos AuthService
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
      this.vistaActiva = 'resumen';
      this.router.navigateByUrl('/pyme/orders');
      return;
    }
    this.vistaActiva = v;
  }

  irAOrdenes() {
    this.vistaActiva = 'resumen';
    this.router.navigateByUrl('/pyme/orders');
  }

  // =========================
  // UserData (Usando AuthService)
  // =========================
  async cargarDatosUsuario() {
    try {
      // ✅ 1. Obtenemos el token correctamente del servicio
      const token = this.authService.getAccessToken();

      if (!token) {
        console.warn('[Dashboard] No hay token, redirigiendo a login');
        this.logout();
        return;
      }

      const res = await fetch(
        `${environment.apiUrl}/api/pyme/me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`, // ✅ Header correcto
            'Content-Type': 'application/json'
          },
        }
      );

      if (!res.ok) {
        // Si el token expiró (401), cerramos sesión
        if (res.status === 401) {
          this.logout();
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const pyme = await res.json();
      console.log('✅ [Dashboard] Datos Pyme:', pyme);

      this.empresaNombre = pyme.razon_social;
      this.codigoPyme = pyme.codigo_pyme;

    } catch (error) {
      console.error('[PYME] Error cargando pyme', error);
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
      const token = this.authService.getAccessToken();
      if (!token) return;

      const response = await fetch(`${environment.apiUrl}/api/pyme/dashboard/metrics`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        this.metrics = data;
      }
    } catch (error) {
      console.error('Error cargando métricas:', error);
      // fallback
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
      const token = this.authService.getAccessToken();
      if (!token) return;

      // ✅ Usamos environment.apiUrl para evitar rutas relativas fallidas
      const response = await fetch(`${environment.apiUrl}/api/pyme/productos`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        this.productos = Array.isArray(data) ? data : [];
        this.productosFiltrados = [...this.productos];
        this.filtrarProductos();
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
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
    // ✅ Usamos el método oficial del servicio
    this.authService.logout(); 
  }
}

