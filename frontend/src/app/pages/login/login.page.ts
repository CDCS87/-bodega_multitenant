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
  IonLabel,
  IonSegment,
  IonSegmentButton
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    CommonModule,
    FormsModule, // 👈 CLAVE
    IonContent,
    IonCard,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonLabel,
    IonSegment,
    IonSegmentButton
  ]
})
export class LoginPage {

  email = '';
  password = '';
  role = 'PYME';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/home'], { replaceUrl: true });
      },
      error: () => {
        alert('Credenciales inválidas');
      }
    });
  }
}



