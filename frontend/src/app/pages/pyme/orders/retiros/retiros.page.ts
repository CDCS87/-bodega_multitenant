import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonList, IonItem, IonLabel, IonText, IonSpinner
} from '@ionic/angular/standalone';

import { RetiroService } from '../../../services/retiro.service';

@Component({
  selector: 'app-retiros',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonList, IonItem, IonLabel, IonText, IonSpinner
  ],
  templateUrl: './retiros.page.html',
  styleUrls: ['./retiros.page.scss']
})
export class RetirosPage implements OnInit {
  loading = false;
  errorMsg = '';
  ordenes: any[] = [];

  constructor(
    private retiroService: RetiroService,
    private router: Router
  ) {}

  ngOnInit() {
    this.load();
  }

  ionViewWillEnter() {
    // para refrescar cuando vuelves desde "crear"
    this.load();
  }

  load() {
    this.loading = true;
    this.errorMsg = '';

    this.retiroService.getRetiros().subscribe({
      next: (ordenes) => {
        this.ordenes = ordenes;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'No se pudieron cargar los retiros';
      }
    });
  }

  goCrear() {
    this.router.navigate(['/pyme/retiros/crear']);
  }

  goDetalle(id: number) {
    this.router.navigate([`/pyme/retiros/${id}`]);
  }
}


