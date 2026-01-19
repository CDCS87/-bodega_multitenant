import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonSegment, IonSegmentButton, IonLabel,
  IonList, IonItem, IonText, IonButton,
  IonSpinner, IonSearchbar, IonChip
} from '@ionic/angular/standalone';

import { RetiroService } from '../../../services/retiro.service';

type TipoPedido = 'retiros' | 'despachos';
type EstadoFiltro = 'TODOS' | 'SOLICITADO' | 'EN_PROCESO' | 'COMPLETADO' | 'FALLIDO' | 'CANCELADO';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonSegment, IonSegmentButton, IonLabel,
    IonList, IonItem, IonText, IonButton,
    IonSpinner, IonSearchbar, IonChip
  ],
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss']
})
export class PedidosPage implements OnInit {
  tipo: TipoPedido = 'retiros';

  estado: EstadoFiltro = 'TODOS';
  q = '';

  loading = false;
  errorMsg = '';

  retiros: any[] = [];
  despachos: any[] = []; // placeholder

  constructor(
    private retiroService: RetiroService,
    private router: Router
  ) {}

  ngOnInit() {
    this.load();
  }

  ionViewWillEnter() {
    this.load();
  }

  setTipo(ev: any) {
    this.tipo = ev?.detail?.value || 'retiros';
    this.errorMsg = '';
    this.load();
  }

  setEstado(next: EstadoFiltro) {
    this.estado = next;
    this.load();
  }

  onSearchChange() {
    this.load();
  }

  private load() {
    this.loading = true;
    this.errorMsg = '';

    if (this.tipo === 'retiros') {
      const filters: any = {};
      if (this.estado !== 'TODOS') filters.estado = this.estado;
      if (this.q.trim()) filters.q = this.q.trim();

      this.retiroService.getRetiros(filters).subscribe({
        next: (list) => {
          this.retiros = Array.isArray(list) ? list : [];
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.errorMsg = err?.error?.message || 'No se pudieron cargar los retiros';
        }
      });
      return;
    }

    // DESPACHOS (cuando exista backend)
    this.despachos = [];
    this.loading = false;
  }

  goCrearRetiro() {
    this.router.navigate(['/pyme/retiros/crear']);
  }

  openItem(o: any) {
    if (this.tipo === 'retiros') {
      this.router.navigate([`/pyme/retiros/${o.id}`]);
      return;
    }
    // this.router.navigate([`/pyme/despachos/${o.id}`]);
  }

  badgeColor(estado: string): string {
    switch (estado) {
      case 'COMPLETADO': return 'success';
      case 'EN_TRÁNSITO':
      case 'EN_TRANSITO': return 'tertiary';
      case 'EN_PREPARACION':
      case 'EN_PREPARACIÓN':
      case 'EN_PROCESO': return 'warning';
      case 'SOLICITADO': return 'primary';
      case 'FALLIDO':
      case 'CANCELADO': return 'danger';
      default: return 'medium';
    }
  }
}
