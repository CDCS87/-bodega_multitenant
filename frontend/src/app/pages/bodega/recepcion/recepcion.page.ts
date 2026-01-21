import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonLabel, IonInput, IonButton,
  IonList, IonText, IonSpinner
} from '@ionic/angular/standalone';

import { RetiroService } from 'src/app/services/retiro.service';

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
    this.errorMsg = '';

    this.retiroService.getPendientesBodega().subscribe({
      next: (list: any) => {
        // si backend devuelve {data:[]}, ajustas acá. Por ahora: array directo
        this.pendientes = Array.isArray(list) ? list : (list?.pendientes ?? []);
        this.loadingList = false;
      },
      error: (err: any) => {
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
      next: (orden: any) => {
        this.loading = false;
        this.codigo = '';

        // Ajuste: si el backend te devuelve { retiro: {id}} etc:
        const id = orden?.id ?? orden?.retiro?.id;
        if (!id) return;

        this.router.navigate([`/bodega/recepcion/${id}`]);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'No se encontró la orden';
      }
    });
  }

  openDetalle(id: number) {
    this.router.navigate([`/bodega/recepcion/${id}`]);
  }
}
