import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { IdleService } from '../services/idle.service';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <ion-content class="ion-padding ion-text-center">
      <div style="margin-top: 40vh;">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Cargando...</p>
      </div>
    </ion-content>
  `,
  imports: [CommonModule, IonContent, IonSpinner]
})
export class HomePage implements OnInit {

  constructor(
    private authService: AuthService,
    private idle: IdleService,
    private router: Router
  ) {}

  ngOnInit() {
    // empieza a contar inactividad al entrar logueado
    this.idle.start();

    this.redirectBasedOnRole();
  }

  private redirectBasedOnRole() {
    const role = this.authService.getUserRole();

    switch (role) {
      case 'PYME':
        this.router.navigate(['/pyme/dashboard.page'], { replaceUrl: true });
        break;
      case 'ADMINISTRADOR':
        this.router.navigate(['/admin/dashboard'], { replaceUrl: true });
        break;
      case 'BODEGA':
        this.router.navigate(['/bodega/recepcion'], { replaceUrl: true });
        break;
      case 'TRANSPORTISTA':
        this.router.navigate(['/transporte/dashboard'], { replaceUrl: true });
        break;
      default:
        this.authService.logout();
        break;
    }
  }
}

