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
  ModalController,
} from '@ionic/angular/standalone';

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
import { Router } from '@angular/router';
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
  sku: string;
  nombre: string;
  cantidad_disponible: number;
  cantidad_reservada: number;
  categoria: string;
  stock_minimo: number;
  codigo_barras?: string | null;
}

interface Orden {
  id: number;
  codigo: string;
  tipo: 'DESPACHO' | 'RETIRO';
  estado:
    | 'SOLICITADO'
    | 'EN_PREPARACION'
    | 'PREPARADO'
    | 'EN_TRANSITO'
    | 'ENTREGADO'
    | 'FALLIDO'
    | 'CANCELADO';
  fecha_creacion: string;
  direccion_destino?: string;
  nombre_cliente?: string;
  foto_evidencia?: string;
  total_productos: number;
}

interface Estadistica {
  ordenesDelMes: number;
  productosMasDespachados: Array<{ nombre: string; cantidad: number }>;
  tiempoPromedioEntrega: number;
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
    IonItem,

    IonFab,
    IonFabButton,
  ],
})
export class DashboardPage implements OnInit {
  // Datos empresa
  empresaNombre: string = '';
  codigoPyme: string = '';

  // métricas
  metrics: DashboardMetrics = {
    productosActivos: 0,
    ordenesActivas: 0,
    volumenOcupado: 0,
    volumenTotal: 0,
    stockBajo: 0,
  };

  // vista
  vistaActiva: 'resumen' | 'inventario' = 'resumen';

  // inventario
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  searchTerm: string = '';
  categoriaSeleccionada: string = 'todas';
  categorias: string[] = [];

  // órdenes (si después las usas)
  ordenes: Orden[] = [];
  ordenesFiltradas: Orden[] = [];

  // estadísticas (si después las usas)
  estadisticas: Estadistica = {
    ordenesDelMes: 0,
    productosMasDespachados: [],
    tiempoPromedioEntrega: 0,
  };

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

  // =====================
  // UI actions
  // =====================
  irAOrdenes() {
    this.router.navigateByUrl('/pyme/orders');
  }

  async refrescarDatos(event?: any) {
    await this.cargarDashboard();
    if (event?.target?.complete) event.target.complete();
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  // =====================
  // Data load
  // =====================
  async cargarDatosUsuario() {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      this.empresaNombre = user.empresa_nombre || 'Mi Empresa';
      this.codigoPyme = user.codigo_pyme || 'PYME001';
    }
  }

  async cargarDashboard() {
    try {
      await Promise.all([
        this.cargarMetricas(),
        this.cargarProductos(),
        // si luego conectas órdenes/estadísticas reales, las reactivas
        // this.cargarOrdenes(),
        // this.cargarEstadisticas(),
      ]);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    }
  }

  async cargarMetricas() {
    try {
      const response = await fetch('/api/pyme/dashboard/metrics', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      this.metrics = data;
    } catch (error) {
      console.error('Error al cargar métricas:', error);
      // fallback dev
      this.metrics = {
        productosActivos: 247,
        ordenesActivas: 18,
        volumenOcupado: 24.8,
        volumenTotal: 37,
        stockBajo: 5,
      };
    }
  }

  async cargarProductos() {
    try {
      const response = await fetch('/api/pyme/productos', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();

      this.productos = Array.isArray(data) ? data : [];
      this.productosFiltrados = [...this.productos];

      this.categorias = [
        ...new Set(this.productos.map((p) => p.categoria).filter(Boolean)),
      ];

      // aplica búsqueda actual (si había)
      this.filtrarProductos();
    } catch (error) {
      console.error('Error al cargar productos:', error);
      this.productos = [];
      this.productosFiltrados = [];
    }
  }

  // =====================
  // Modal crear producto
  // =====================
  async abrirModalCrearProducto() {
    try {
      console.log('CLICK -> abrirModalCrearProducto');

      const modal = await this.modalCtrl.create({
        component: ProductoModalComponent,
      });

      await modal.present();

      const { data } = await modal.onWillDismiss();

      if (data?.created) {
        await this.cargarProductos();
        this.vistaActiva = 'inventario';
      }
    } catch (e) {
      console.error('Error abriendo modal', e);
    }
  }

  // =====================
  // Filtros inventario
  // =====================
  filtrarProductos() {
    const term = (this.searchTerm || '').trim().toLowerCase();

    this.productosFiltrados = (this.productos || []).filter((p) => {
      const matchTerm =
        !term ||
        (p.nombre ?? '').toLowerCase().includes(term) ||
        (p.sku ?? '').toLowerCase().includes(term) ||
        ((p.codigo_barras ?? '') as string).toLowerCase().includes(term);

      const matchCat =
        this.categoriaSeleccionada === 'todas' ||
        !p.categoria ||
        p.categoria === this.categoriaSeleccionada;

      return matchTerm && matchCat;
    });
  }

  // =====================
  // Helpers volumen
  // =====================
  get porcentajeVolumen(): number {
    const total = Number(this.metrics?.volumenTotal ?? 0);
    const ocupado = Number(this.metrics?.volumenOcupado ?? 0);
    if (!total || total <= 0) return 0;
    return (ocupado / total) * 100;
  }

  getColorVolumen(): string {
    const p = this.porcentajeVolumen;
    if (p < 70) return 'success';
    if (p < 90) return 'warning';
    return 'danger';
  }

  // =====================
  // (Opcional) Cambiar vista
  // =====================
  cambiarVista(vista: 'resumen' | 'inventario') {
    this.vistaActiva = vista;
  }
}



