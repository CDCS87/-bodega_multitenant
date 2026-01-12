import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonContent, IonSpinner],
  template: `
    <ion-content class="ion-padding ion-text-center">
      <div style="margin-top: 40vh;">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Cargando sesión...</p>
      </div>
    </ion-content>
  `
})
export class HomePage implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.redirectByRole();
  }

  private redirectByRole() {
    const role = this.authService.getUserRole();

    console.log('🔀 Rol detectado:', role);

    switch (role) {
      case 'PYME':
        this.router.navigate(['/pyme/dashboard'], { replaceUrl: true });
        break;

      case 'ADMINISTRADOR':
        this.router.navigate(['/admin/dashboard'], { replaceUrl: true });
        break;

      case 'BODEGA':
        this.router.navigate(['/bodega/picking'], { replaceUrl: true });
        break;

      case 'TRANSPORTISTA':
        this.router.navigate(['/transportista/rutas'], { replaceUrl: true });
        break;

      default:
        console.error('❌ Rol inválido o no encontrado');
        this.authService.logout();
        break;
    }
  }
}
