import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButton
} from '@ionic/angular/standalone';

import { Router } from '@angular/router';

@Component({
  selector: 'app-transporte-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Transporte Dashboard</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-button (click)="goRetiros()">Retiros</ion-button>
      <ion-button (click)="goDespachos()">Despachos</ion-button>
    </ion-content>
  `,
  styles: []
})
export class TransporteDashboardPage {
  constructor(private router: Router) {}

  goRetiros() {
    this.router.navigate(['/transporte/retiros']);
  }

  goDespachos() {
    this.router.navigate(['/transporte/despachos']);
  }
}
