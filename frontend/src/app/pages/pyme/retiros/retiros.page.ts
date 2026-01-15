import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';

@Component({
  selector: 'app-retiros',
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonList, IonItem, IonLabel],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Órdenes de Retiro</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-button expand="block" (click)="goCreate()">Crear orden de retiro</ion-button>

      <!-- Placeholder hasta que implementemos backend de órdenes -->
      <ion-list>
        <ion-item>
          <ion-label>
            <h2>Sin órdenes aún</h2>
            <p>Crea tu primera orden de retiro.</p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  `
})
export class RetirosPage {
  constructor(private router: Router) {}
  goCreate() {
    this.router.navigate(['/pyme/retiros/crear']);
  }
}
