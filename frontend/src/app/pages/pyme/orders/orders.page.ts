import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonButton, IonItem, IonLabel, IonSelect, IonSelectOption,
  IonInput, IonButtons, IonBackButton,
  IonGrid, IonRow, IonCol,
  IonList, IonText, IonChip, IonNote, IonBadge, IonModal, 
  IonIcon, IonSpinner, IonItemGroup 
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  cubeOutline, carOutline, searchOutline, 
  locationOutline, alertCircleOutline, folderOpenOutline 
} from 'ionicons/icons';
import { RetiroService } from 'src/app/services/retiro.service'; // <--- IMPORTANTE

type Tipo = 'ALL' | 'RETIRO' | 'DESPACHO';

// Incluimos todos los estados posibles del sistema
type Estado =
  | 'ALL'
  | 'SOLICITADO' | 'ASIGNADO' | 'RETIRADO' | 'EN_BODEGA' | 'COMPLETADO' // Retiros
  | 'EN_PREPARACION' | 'PREPARADO' | 'EN_TRANSITO' | 'ENTREGADO' // Despachos
  | 'CANCELADO' | 'RECHAZADO' | 'FALLIDO';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle,
    IonButton, IonItem, IonLabel, IonSelect, IonSelectOption,
    IonInput, IonButtons, IonBackButton,
    IonGrid, IonRow, IonCol,
    IonList, IonBadge, IonIcon, IonSpinner, IonItemGroup
],
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss']
})
export class OrdersPage implements OnInit {
  
  nombrePyme = '';
  loading = false;

  filters = {
    tipo: 'ALL' as Tipo,
    estado: 'ALL' as Estado,
    q: ''
  };

  orders: any[] = [];
  filtered: any[] = [];

  private searchDebounce: any;

  constructor(
    private router: Router,
    private retiroService: RetiroService // <--- Inyectamos el servicio
  ) {
    // Registramos los iconos visuales
    addIcons({ 
      cubeOutline, carOutline, searchOutline, 
      locationOutline, alertCircleOutline, folderOpenOutline 
    });
  }

  ngOnInit() {
    // Obtenemos datos del usuario si es necesario
    const ud = localStorage.getItem('userData');
    if (ud) {
      const u = JSON.parse(ud);
      this.nombrePyme = u.nombrePyme ?? '';
    }
  }

  ionViewWillEnter() {
    this.reload();
  }

  // =====================
  // Carga de Datos
  // =====================
  async reload() {
    this.loading = true;
    this.retiroService.getMyRetiros().subscribe({
      next: (res: any) => {
        console.log('📦 RESPUESTA DEL BACKEND:', res);

        const listaCruda = res.retiros || res.data || (Array.isArray(res) ? res : []);

        const retiros = listaCruda.map((r: any) => ({
          ...r,
          tipo: 'RETIRO',
          createdAt: r.createdAt || r.fecha_creacion || new Date(),
          estado: r.estado || 'SOLICITADO',
          codigo: r.codigo || 'SIN-CODIGO'
        }));

        this.orders = [...retiros];
        this.applyFilters();
        this.loading = false;
        
        console.log('✅ Órdenes procesadas:', this.orders);
      },
      error: (err) => {
        console.error('❌ Error cargando historial:', err);
        this.loading = false;
      }
    });
  }

  // =====================
  // Navegación
  // =====================
  goToRetiro() {
    this.router.navigateByUrl('/pyme/orders/retiros/crear');
  }

  goToDespacho() {
    alert('Módulo de Despachos: Próximamente');
  }

  openOrder(o: any) {
    if (o.tipo === 'RETIRO') {
      // ✅ AHORA SÍ NAVEGAMOS
      // Asegúrate que 'o.id' sea el ID correcto de tu BD
      this.router.navigate(['/pyme/orders/retiros', o.id]); 
    } else {
      alert('Detalle despacho pendiente');
    }
  }

  // =====================
  // Filtros
  // =====================
  onSearch() {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.applyFilters(), 250);
  }

  resetFilters() {
    this.filters = { tipo: 'ALL', estado: 'ALL', q: '' };
    this.applyFilters();
  }

  applyFilters() {
    const q = (this.filters.q || '').trim().toLowerCase();

    this.filtered = (this.orders || []).filter(o => {
      const okTipo = this.filters.tipo === 'ALL' || o.tipo === this.filters.tipo;
      const okEstado = this.filters.estado === 'ALL' || o.estado === this.filters.estado;
      
      // Buscamos por código o comuna
      const codigo = (o.codigo || '').toLowerCase();
      const comuna = (o.comuna || '').toLowerCase();
      const okQ = !q || codigo.includes(q) || comuna.includes(q);

      return okTipo && okEstado && okQ;
    });
    
    // Ordenamos por fecha (más reciente primero)
    this.filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // =====================
  // UI Helpers (Colores y Textos)
  // =====================
  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'COMPLETADO': 
      case 'ENTREGADO':  
        return 'success';   // Verde

      case 'EN_BODEGA':  
      case 'RETIRADO':
        return 'warning';   // Amarillo (En proceso)

      case 'EN_TRANSITO': 
      case 'EN_PREPARACION':
      case 'PREPARADO':
        return 'tertiary';  // Azul

      case 'SOLICITADO': 
      case 'ASIGNADO':
        return 'medium';    // Gris

      case 'FALLIDO': 
      case 'CANCELADO': 
      case 'RECHAZADO':
        return 'danger';    // Rojo

      default: return 'light';
    }
  }

  getEstadoTexto(estado: string): string {
    const diccionario: any = {
      'SOLICITADO': 'Solicitud Enviada',
      'ASIGNADO': 'Transportista Asignado',
      'RETIRADO': 'Recolectado',
      'EN_BODEGA': 'En Recepción',
      'COMPLETADO': 'Ingresado Stock',
      
      'EN_PREPARACION': 'Preparando',
      'PREPARADO': 'Listo Despacho',
      'EN_TRANSITO': 'En Ruta',
      'ENTREGADO': 'Entregado',
      
      'CANCELADO': 'Cancelado'
    };
    return diccionario[estado] || estado;
  }
}


