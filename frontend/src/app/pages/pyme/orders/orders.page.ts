import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonCard, IonCardContent, IonButton, IonItem, IonLabel,
  IonSelect, IonSelectOption, IonInput, IonBadge, IonNote, IonModal,
  IonHeader, IonToolbar, IonTitle, IonButtons, IonContent
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';

type Tipo = 'ALL'|'DESPACHO'|'RETIRO';
type Estado = 'ALL'|'SOLICITADO'|'EN_PREPARACION'|'PREPARADO'|'EN_TRANSITO'|'ENTREGADO'|'FALLIDO'|'CANCELADO';

@Component({
  selector: 'app-pyme-orders',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonCard, IonCardContent, IonButton, IonItem, IonLabel,
    IonSelect, IonSelectOption, IonInput, IonBadge, IonNote, IonModal,
    IonHeader, IonToolbar, IonTitle, IonButtons
  ],
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss']
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

  dateModalOpen = false;
  tempDesde: string | null = null;
  tempHasta: string | null = null;

  orders: Array<any> = [];

  private searchDebounce: any;

  constructor(private router: Router) {}

  ionViewWillEnter() {
    this.reload();
  }

  // ✅ RUTAS NUEVAS (ajústalas a tus routes reales)
  goToRetiro() {
    this.router.navigateByUrl('/pyme/orders/retiros/crear');
  }

  goToDespacho() {
    this.router.navigateByUrl('/pyme/orders/despachos/crear');
  }

  // ✅ DETALLE SEGÚN TIPO
  openOrder(o: any) {
    const tipo = (o.tipo ?? '').toUpperCase();
    if (tipo === 'RETIRO') {
      this.router.navigateByUrl(`/pyme/orders/retiros/${o.id}`);
      return;
    }
    // default: despacho
    this.router.navigateByUrl(`/pyme/orders/despachos/${o.id}`);
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

  // ✅ limpia solo el modal (no aplicado)
  clearDates() {
    this.tempDesde = null;
    this.tempHasta = null;
  }

  // ✅ limpia filtro aplicado + recarga
  clearAppliedDates() {
    this.filters.desde = null;
    this.filters.hasta = null;
    this.reload();
  }

  resetFilters() {
    this.filters = { tipo: 'ALL', estado: 'ALL', desde: null, hasta: null, q: '' };
    this.reload();
  }

  onSearch() {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.reload(), 350);
  }

  async reload() {
    this.loading = true;

    try {
      // TODO: llamar API real
      // this.orders = await this.ordersService.list(this.filters);

      this.orders = []; // mock
    } finally {
      this.loading = false;
    }
  }

  badgeColor(estado: string) {
    switch (estado) {
      case 'ENTREGADO': return 'success';
      case 'EN_TRANSITO': return 'tertiary';
      case 'PREPARADO': return 'primary';
      case 'EN_PREPARACION': return 'warning';
      case 'FALLIDO': return 'danger';
      case 'CANCELADO': return 'medium';
      default: return 'secondary';
    }
  }

  labelEstado(estado: string) {
    const map: Record<string,string> = {
      SOLICITADO: 'Solicitado',
      EN_PREPARACION: 'En preparación',
      PREPARADO: 'Preparado',
      EN_TRANSITO: 'En tránsito',
      ENTREGADO: 'Entregado',
      FALLIDO: 'Fallido',
      CANCELADO: 'Cancelado'
    };
    return map[estado] ?? estado;
  }
}
