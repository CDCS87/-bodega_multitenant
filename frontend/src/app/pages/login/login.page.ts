import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonContent,
  IonCard,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    CommonModule,
    FormsModule,          // ✅ ngModel
    IonContent,
    IonCard,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
  ],
})
export class LoginPage {
  email = '';
  password = '';

  // ✅ existe para el [(ngModel)]="role" del ion-segment
  role: 'ADMINISTRADOR' | 'PYME' | 'BODEGA' | 'TRANSPORTISTA' = 'PYME';

  loading = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    this.loading = true;
    this.error = null;

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/home'], { replaceUrl: true });
      },
      error: (err) => {
        console.error('Login error:', err);
        this.loading = false;
        this.error = 'Credenciales inválidas';
      }
    });
  }
}





