import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonLabel, IonInput, IonButton,
  IonList, IonText, IonSpinner
} from '@ionic/angular/standalone';

import { RetiroService } from '../../../../services/retiro.service';
import { FormsModule } from '@angular/forms';

type DetalleVM = {
  id: number;
  nombre_producto: string;
  cantidad_esperada: number;
  cantidad_recibida: number;
  sku_generado?: string;
};

@Component({
  selector: 'app-bodega-recepcion-detalle',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonItem, IonLabel, IonInput, IonButton,
    IonList, IonText, IonSpinner
  ],
  templateUrl: './recepcion-detalle.page.html',
  styleUrls: ['./recepcion-detalle.page.scss']
})
export class RecepcionDetallePage implements OnInit {
  id!: number;

  loading = false;
  saving = false;
  errorMsg = '';

  orden: any = null;
  detalle: DetalleVM[] = [];

  // fotos opcional (MVP)
  fotos: File[] = [];

  constructor(
    private route: ActivatedRoute,
    private retiroService: RetiroService,
    private router: Router
  ) {}

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load() {
    this.loading = true;
    this.errorMsg = '';
    this.retiroService.getRetiroById(this.id).subscribe({
      next: (o) => {
        this.orden = o;
        this.detalle = (o.detalle || []).map((d: any) => ({
          id: d.id,
          nombre_producto: d.nombre_producto,
          cantidad_esperada: d.cantidad_esperada,
          cantidad_recibida: d.cantidad_recibida ?? 0,
          sku_generado: d.sku_generado
        }));
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'No se pudo cargar la orden';
      }
    });
  }

  onFiles(ev: any) {
    const files: FileList = ev.target.files;
    this.fotos = files ? Array.from(files) : [];
  }

  confirmar() {
    if (this.saving) return;

    this.errorMsg = '';
    for (const d of this.detalle) {
      const n = Number(d.cantidad_recibida);
      if (!Number.isInteger(n) || n < 0) {
        this.errorMsg = `Cantidad recibida inválida para ${d.nombre_producto}`;
        return;
      }
      if (n > d.cantidad_esperada) {
        // opcional: permitir, pero yo lo marco como error para MVP
        this.errorMsg = `Cantidad recibida no puede exceder esperada (${d.nombre_producto})`;
        return;
      }
    }

    this.saving = true;

    const payload = this.detalle.map(d => ({
      detalle_id: d.id,
      cantidad_recibida: Number(d.cantidad_recibida)
    }));

    this.retiroService.confirmarIngresoBodega(this.id, payload, this.fotos).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/bodega/recepcion'], { replaceUrl: true });
      },
      error: (err) => {
        this.saving = false;
        this.errorMsg = err?.error?.message || 'No se pudo confirmar ingreso';
      }
    });
  }
}
