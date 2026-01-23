import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonButton, IonItem, IonLabel, IonSelect, IonSelectOption,
  IonInput, IonButtons, IonBackButton,
  IonGrid, IonRow, IonCol,
  IonList, IonText, IonChip, IonNote, IonBadge, IonModal } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

type Tipo = 'ALL' | 'RETIRO' | 'DESPACHO';
type Estado =
  | 'ALL'
  | 'SOLICITADO'
  | 'ASIGNADO'
  | 'EN_PREPARACION'
  | 'PREPARADO'
  | 'EN_TRANSITO'
  | 'ENTREGADO'
  | 'CANCELADO';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [IonBadge,
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle,
    IonButton, IonItem, IonLabel, IonSelect, IonSelectOption,
    IonInput, IonButtons, IonBackButton,
    IonGrid, IonRow, IonCol,
    IonList, IonText],
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss']
})
export class OrdersPage {
  nombrePyme = '';
  codigoPyme = '';
  direccionPyme = '';

  loading = false;

  filters = {
    tipo: 'ALL' as Tipo,
    estado: 'ALL' as Estado,
    q: ''
  };

  // historial (mock por ahora)
  orders: Array<{
    id: number;
    codigo: string;
    tipo: 'RETIRO' | 'DESPACHO';
    estado: Estado;
  }> = [];

  filtered: typeof this.orders = [];

  private searchDebounce: any;

  constructor(private router: Router) {}

  ionViewWillEnter() {
    const ud = localStorage.getItem('userData');
    if (ud) {
      const u = JSON.parse(ud);
      this.nombrePyme = u.nombrePyme ?? '';
      this.codigoPyme = u.codigoPyme ?? '';
      this.direccionPyme = u.direccionPyme ?? '';
    }

    this.reload();
  }

  // =====================
  // Navegación
  // =====================
  goToRetiro() {
    // 
    this.router.navigateByUrl('/pyme/orders/retiros/crear');
  }

  goToDespacho() {
    alert('Despachos pendiente');
  }

  openOrder(o: any) {
    if (o.tipo === 'RETIRO') this.router.navigate(['/pyme/orders/retiros', o.id]);
    else alert('Detalle despacho pendiente');
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
      const okQ = !q || (o.codigo ?? '').toLowerCase().includes(q);
      return okTipo && okEstado && okQ;
    });
  }

  // =====================
  // Carga (mock por ahora)
  // =====================
  async reload() {
    this.loading = true;

    // TODO: aquí después conectamos backend real.
    this.orders = [];

    this.applyFilters();
    this.loading = false;
  }

  // =====================
  // Helpers UI
  // =====================
  badgeColor(estado: string) {
    const map: any = {
      SOLICITADO: 'medium',
      ASIGNADO: 'secondary',
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
      ASIGNADO: 'Asignado',
      EN_PREPARACION: 'En preparación',
      PREPARADO: 'Preparado',
      EN_TRANSITO: 'En tránsito',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado'
    };
    return map[estado] || estado;
  }
}


