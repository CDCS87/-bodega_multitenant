import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonCard, IonCardContent, IonCardHeader, IonButton, IonItem, IonLabel, IonSelect, IonSelectOption, IonInput, IonBadge, IonNote, IonModal, IonDatetime, IonButtons, IonBackButton, IonCardTitle, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

type Tipo = 'ALL' | 'RETIRO' | 'DESPACHO';
type Estado =
  | 'ALL'
  | 'SOLICITADO'
  | 'EN_PREPARACION'
  | 'PREPARADO'
  | 'EN_TRANSITO'
  | 'ENTREGADO'
  | 'CANCELADO';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [IonCardTitle,
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonCard, IonCardContent, IonCardHeader,
    IonButton, IonItem, IonLabel, IonSelect,
    IonSelectOption, IonInput, IonBadge, IonNote,
    IonModal, IonDatetime, IonButtons, IonBackButton, IonGrid, IonHeader, IonRow, IonGrid, IonCol,IonRow],
  templateUrl: './orders.page.html'
})
export class OrdersPage {

  loading = false;

  filters = {
    tipo: 'ALL' as Tipo,
    estado: 'ALL' as Estado,
    desde: null as string | null,
    hasta: null as string | null,
    q: ''
  };

  orders: any[] = [];

  dateModalOpen = false;
  tempDesde: string | null = null;
  tempHasta: string | null = null;

  private searchDebounce: any;

  constructor(private router: Router) {}

  ionViewWillEnter() {
    this.reload();
  }

  // =====================
  // Navegación
  // =====================
  goToRetiro() {
    this.router.navigate(['/pyme/orders/retiros/create']);
  }

  goToDespacho() {
    this.router.navigate(['/pyme/orders/despachos/create']);
  }

  openOrder(o: any) {
    const base = o.tipo === 'RETIRO' ? 'retiros' : 'despachos';
    this.router.navigate([`/pyme/orders/${base}/detalle/${o.id}`]);
  }

  // =====================
  // Filtros
  // =====================
  onSearch() {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.reload(), 300);
  }

  resetFilters() {
    this.filters = { tipo:'ALL', estado:'ALL', desde:null, hasta:null, q:'' };
    this.reload();
  }

  openDateModal() {
    this.tempDesde = this.filters.desde;
    this.tempHasta = this.filters.hasta;
    this.dateModalOpen = true;
  }

  applyDates() {
    this.filters.desde = this.tempDesde;
    this.filters.hasta = this.tempHasta;
    this.dateModalOpen = false;
    this.reload();
  }

  // =====================
  // Carga (mock por ahora)
  // =====================
  async reload() {
    this.loading = true;

    // 👉 Aquí luego conectas backend real
    this.orders = [];

    this.loading = false;
  }

  // =====================
  // Helpers UI
  // =====================
  badgeColor(estado: string) {
    const map: any = {
      SOLICITADO: 'medium',
      EN_PREPARACION: 'warning',
      PREPARADO: 'primary',
      EN_TRANSITO: 'tertiary',
      ENTREGADO: 'success',
      CANCELADO: 'dark'
    };
    return map[estado] || 'medium';
  }

  labelEstado(estado: string) {
    const map: any = {
      SOLICITADO: 'Solicitado',
      EN_PREPARACION: 'En preparación',
      PREPARADO: 'Preparado',
      EN_TRANSITO: 'En tránsito',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado'
    };
    return map[estado] || estado;
  }
}

