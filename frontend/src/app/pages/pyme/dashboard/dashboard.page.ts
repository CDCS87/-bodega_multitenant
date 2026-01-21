import { AuthService } from '../../../services/auth.service';
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
  IonSelect,
  IonSelectOption,
  IonList,
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonChip,
  IonModal,
  IonDatetime,
  IonFab,
  IonFabButton,
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
} from 'ionicons/icons';
import { ProductService } from '../../../services/product.service';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
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
    IonFabButton
],
})
export class DashboardPage implements OnInit {
  // Datos de la empresa
  empresaNombre: string = '';
  codigoPyme: string = '';

  // Métricas del dashboard
  metrics: DashboardMetrics = {
    productosActivos: 0,
    ordenesActivas: 0,
    volumenOcupado: 0,
    volumenTotal: 0,
    stockBajo: 0,
  };

  // Vista activa
  vistaActiva: 'resumen' | 'inventario' | 'ordenes' | 'estadisticas' = 'resumen';

  // Datos de inventario
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  searchTerm: string = '';
  categoriaSeleccionada: string = 'todas';
  categorias: string[] = [];

  // Datos de órdenes
  ordenes: Orden[] = [];
  ordenesFiltradas: Orden[] = [];
  tipoOrdenFiltro: 'TODAS' | 'DESPACHO' | 'RETIRO' = 'TODAS';
  estadoOrdenFiltro: string = 'TODAS';
  fechaInicio: string = '';
  fechaFin: string = '';

  // Estadísticas
  estadisticas: Estadistica = {
    ordenesDelMes: 0,
    productosMasDespachados: [],
    tiempoPromedioEntrega: 0,
  };

  // Modal de evidencia
  mostrarModalEvidencia: boolean = false;
  evidenciaSeleccionada: string = '';
  ordenSeleccionada: Orden | null = null;

  constructor(
  private productService: ProductService,
  private router: Router,
  private modalCtrl: ModalController,
  private authService: AuthService,
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
  });
}

  ngOnInit() {
    this.cargarDatosUsuario();
    this.cargarDashboard();
  }

    irAOrdenes() {
    this.router.navigateByUrl('/pyme/orders');
  }

  async cargarDatosUsuario() {
    // Obtener datos del usuario desde localStorage o servicio
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
        this.cargarOrdenes(),
        this.cargarEstadisticas(),
      ]);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    }
  }

  async cargarMetricas() {
    try {
      // Llamada al backend para obtener métricas
      const response = await fetch('/api/pyme/dashboard/metrics', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      this.metrics = data;
    } catch (error) {
      console.error('Error al cargar métricas:', error);
      // Datos de ejemplo para desarrollo
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
      this.productos = data;
      this.productosFiltrados = data;
      
      // Extraer categorías únicas
      this.categorias = [
        ...new Set(this.productos.map((p) => p.categoria)),
      ];
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  }

async abrirModalCrearProducto() {
  const modal = await this.modalCtrl.create({
    component: ProductoModalComponent
  });

  await modal.present();
  const { data } = await modal.onWillDismiss();

  if (data?.created) {
    await this.cargarProductos();
    this.vistaActiva = 'inventario';
  }
}


  async cargarOrdenes() {
    try {
      const response = await fetch('/api/pyme/ordenes', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      this.ordenes = data;
      this.ordenesFiltradas = data;
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
    }
  }

  async cargarEstadisticas() {
    try {
      const response = await fetch('/api/pyme/dashboard/estadisticas', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      this.estadisticas = data;
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      // Datos de ejemplo
      this.estadisticas = {
        ordenesDelMes: 45,
        productosMasDespachados: [
          { nombre: 'Producto A', cantidad: 120 },
          { nombre: 'Producto B', cantidad: 95 },
          { nombre: 'Producto C', cantidad: 78 },
        ],
        tiempoPromedioEntrega: 2.5,
      };
    }
  }

  // Filtrado de inventario
  filtrarProductos() {
    this.productosFiltrados = this.productos.filter((producto) => {
      const coincideNombre = producto.nombre
        .toLowerCase()
        .includes(this.searchTerm.toLowerCase());
      const coincideCategoria =
        this.categoriaSeleccionada === 'todas' ||
        producto.categoria === this.categoriaSeleccionada;
      return coincideNombre && coincideCategoria;
    });
  }

  // Filtrado de órdenes
  filtrarOrdenes() {
    this.ordenesFiltradas = this.ordenes.filter((orden) => {
      const coincideTipo =
        this.tipoOrdenFiltro === 'TODAS' || orden.tipo === this.tipoOrdenFiltro;
      const coincideEstado =
        this.estadoOrdenFiltro === 'TODAS' ||
        orden.estado === this.estadoOrdenFiltro;

      let coincideFecha = true;
      if (this.fechaInicio && this.fechaFin) {
        const fechaOrden = new Date(orden.fecha_creacion);
        const inicio = new Date(this.fechaInicio);
        const fin = new Date(this.fechaFin);
        coincideFecha = fechaOrden >= inicio && fechaOrden <= fin;
      }

      return coincideTipo && coincideEstado && coincideFecha;
    });
  }

  // Calcular porcentaje de volumen
  get porcentajeVolumen(): number {
    return (this.metrics.volumenOcupado / this.metrics.volumenTotal) * 100;
  }

  // Obtener color para el indicador de volumen
  getColorVolumen(): string {
    const porcentaje = this.porcentajeVolumen;
    if (porcentaje < 70) return 'success';
    if (porcentaje < 90) return 'warning';
    return 'danger';
  }

  // Obtener color para el estado de orden
  getColorEstado(estado: string): string {
    const colores: { [key: string]: string } = {
      SOLICITADO: 'medium',
      EN_PREPARACION: 'warning',
      PREPARADO: 'primary',
      EN_TRANSITO: 'tertiary',
      ENTREGADO: 'success',
      FALLIDO: 'danger',
      CANCELADO: 'dark',
    };
    return colores[estado] || 'medium';
  }

  // Obtener texto legible para el estado
  getTextoEstado(estado: string): string {
    const textos: { [key: string]: string } = {
      SOLICITADO: 'Solicitado',
      EN_PREPARACION: 'En Preparación',
      PREPARADO: 'Preparado',
      EN_TRANSITO: 'En Tránsito',
      ENTREGADO: 'Entregado',
      FALLIDO: 'Fallido',
      CANCELADO: 'Cancelado',
    };
    return textos[estado] || estado;
  }

  // Ver evidencia fotográfica
  verEvidencia(orden: Orden) {
    if (orden.foto_evidencia) {
      this.ordenSeleccionada = orden;
      this.evidenciaSeleccionada = orden.foto_evidencia;
      this.mostrarModalEvidencia = true;
    }
  }

  cerrarModalEvidencia() {
    this.mostrarModalEvidencia = false;
    this.evidenciaSeleccionada = '';
    this.ordenSeleccionada = null;
  }

  // Navegación
  irACrearOrden() {
    this.router.navigate(['/pyme/crear-orden']);
  }

  irAGestionProductos() {
    this.router.navigate(['/pyme/productos']);
  }

  verDetalleOrden(orden: Orden) {
    this.router.navigate(['/pyme/ordenes', orden.id]);
  }

  verDetalleProducto(producto: Producto) {
    this.router.navigate(['/pyme/productos', producto.id]);
  }

  // Exportar reportes
  async exportarReporte(tipo: 'inventario' | 'ordenes' | 'estadisticas') {
    try {
      const response = await fetch(
        `/api/pyme/reportes/${tipo}?fechaInicio=${this.fechaInicio}&fechaFin=${this.fechaFin}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-${tipo}-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al exportar reporte:', error);
      alert('Error al exportar el reporte');
    }
  }

  // Refrescar datos
  async refrescarDatos(event?: any) {
    await this.cargarDashboard();
    if (event) {
      event.target.complete();
    }
  }

  // Cambiar vista
  cambiarVista(vista: 'resumen' | 'inventario' | 'ordenes' | 'estadisticas') {
    this.vistaActiva = vista;
  }
  // Cerrar sesión
  logout() {
  this.authService.logout();
  this.router.navigateByUrl('/login', { replaceUrl: true });
}

}


