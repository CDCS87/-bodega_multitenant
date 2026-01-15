import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
  IonList, IonItem, IonLabel
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-retiros',
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonList, IonItem, IonLabel],
  templateUrl: './retiros.page.html',
  styleUrls: ['./retiros.page.scss'],
})
export class RetirosPage {
  constructor(private router: Router) {}

  goCreate() {
    this.router.navigate(['/pyme/retiros/crear']);
  }
}

