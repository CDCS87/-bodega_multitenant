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
    this.idle.start();
  }

  // ✅ en Ionic es más confiable redirigir acá
  ionViewDidEnter() {
    this.redirectBasedOnRole();
  }

  private redirectBasedOnRole() {
    const roleRaw = this.authService.getUserRole();
    const role = String(roleRaw || '').toUpperCase().trim();

    console.log('[HOME] roleRaw:', roleRaw, ' roleNormalized:', role);
    console.log('--- DEBUG REDIRECT ---');
    console.log('Comparando:', role, 'con ADMINISTRADOR');
    console.log('¿Son iguales?:', role === 'ADMINISTRADOR');

    if (role === 'ADMINISTRADOR') {
    console.log('Entrando al caso ADMINISTRADOR...');
    this.router.navigateByUrl('/admin/usuarios', { replaceUrl: true });
    return;
  }

    // ✅ Si no hay token/rol, fuera
    if (!role) {
      console.log('[HOME] sin rol -> logout');
      this.authService.logout();
      this.router.navigateByUrl('/login', { replaceUrl: true });
      return;
    }

    switch (role) {
      case 'PYME':
        console.log('[HOME] -> /pyme/dashboard');
        this.router.navigateByUrl('/pyme/dashboard', { replaceUrl: true });
        break;

      case 'ADMINISTRADOR':
        this.router.navigateByUrl('/admin/usuarios', { replaceUrl: true });
        break;

      case 'BODEGA':
        this.router.navigateByUrl('/bodega/recepcion', { replaceUrl: true });
        break;

      case 'TRANSPORTISTA':
        this.router.navigateByUrl('/transporte/dashboard', { replaceUrl: true });
        break;

      default:
        console.log('[HOME] rol desconocido -> logout', role);
        this.authService.logout();
        this.router.navigateByUrl('/login', { replaceUrl: true });
        break;
    }
  }
}


