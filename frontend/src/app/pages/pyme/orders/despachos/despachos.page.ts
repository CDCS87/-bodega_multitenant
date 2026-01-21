import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonButtons, IonBackButton,
  IonCard, IonCardContent,
  IonButton, IonIcon,
  IonItem, IonLabel, IonSelect, IonSelectOption,
  IonInput, IonBadge,
  IonSkeletonText, IonList, IonText, IonSegment } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
;



type Estado = 'ALL'|'SOLICITADO'|'EN_PREPARACION'|'PREPARADO'|'EN_TRANSITO'|'ENTREGADO'|'FALLIDO'|'CANCELADO';

export interface Despacho {
  id: string | number;
  codigo: string;
  estado: string;
  fecha: string;        // ISO string
  destino?: string;
  items?: number;
}

@Component({
  selector: 'app-despachos',
  standalone: true,
  imports: [IonSegment, IonText, IonList, 
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonButtons, IonBackButton,
    IonCard, IonCardContent,
    IonButton, IonIcon,
    IonItem, IonLabel, IonSelect, IonSelectOption,
    IonInput, IonBadge,
    IonSkeletonText
  ],
  templateUrl: './despachos.page.html',
  styleUrls: ['./despachos.page.scss']
})
export class DespachosPage {
  loading = false;

  filters = {
    estado: 'ALL' as Estado,
    q: ''
  };

  despachos: Despacho[] = [];
  private searchDebounce: any;

  constructor(private router: Router) {
    // addIcons({ addOutline, refreshOutline }); // opcional
  }

  ionViewWillEnter() {
    this.reload();
  }

  goToCrear() {
    this.router.navigateByUrl('/pyme/orders/despachos/crear');
  }

  openDetalle(d: any) {
    this.router.navigateByUrl(`/pyme/orders/despachos/${d.id}`);
  }

  onSearch() {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.reload(), 300);
  }

  async reload() {
    this.loading = true;
    try {
      // TODO: reemplaza con tu API real:
      // this.despachos = await this.despachosService.list(this.filters);

      // Mock
      this.despachos = [
        // ejemplo:
        // { id: 1, codigo: 'OD-2026-0012', estado: 'EN_TRANSITO', fecha: new Date().toISOString(), destino: 'Providencia', items: 3 }
      ].filter(d => {
        const matchEstado = this.filters.estado === 'ALL' || d.estado === this.filters.estado;
        const q = (this.filters.q || '').toLowerCase().trim();
        const matchQ =
          !q ||
          (d.codigo ?? '').toLowerCase().includes(q) ||
          (d.destino ?? '').toLowerCase().includes(q);
        return matchEstado && matchQ;
      });
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

