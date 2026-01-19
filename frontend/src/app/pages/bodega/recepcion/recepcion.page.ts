import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonLabel, IonInput, IonButton,
  IonList, IonText, IonSpinner
} from '@ionic/angular/standalone';

import { RetiroService } from '../../../services/retiro.service';

@Component({
  selector: 'app-bodega-recepcion',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonItem, IonLabel, IonInput, IonButton,
    IonList, IonText, IonSpinner
  ],
  templateUrl: './recepcion.page.html',
  styleUrls: ['./recepcion.page.scss']
})
export class RecepcionPage implements OnInit {
  codigo = '';
  loading = false;
  loadingList = false;
  errorMsg = '';

  pendientes: any[] = [];

  constructor(
    private retiroService: RetiroService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPendientes();
  }

  loadPendientes() {
    this.loadingList = true;
    this.retiroService.getPendientesBodega().subscribe({
      next: (list) => {
        this.pendientes = list || [];
        this.loadingList = false;
      },
      error: (err) => {
        this.loadingList = false;
        this.errorMsg = err?.error?.message || 'No se pudieron cargar pendientes';
      }
    });
  }

  buscar() {
    this.errorMsg = '';
    const c = this.codigo.trim();
    if (!c) {
      this.errorMsg = 'Ingresa un código o QR.';
      return;
    }

    this.loading = true;
    this.retiroService.scanRetiro(c).subscribe({
      next: (orden) => {
        this.loading = false;
        this.codigo = '';
        this.router.navigate([`/bodega/recepcion/${orden.id}`]);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'No se encontró la orden';
      }
    });
  }

  openDetalle(id: number) {
    this.router.navigate([`/bodega/recepcion/${id}`]);
  }
}
