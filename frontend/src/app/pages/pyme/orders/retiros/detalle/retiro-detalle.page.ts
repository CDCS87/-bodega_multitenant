import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonButtons, IonBackButton,
  IonCard, IonCardContent, IonText, IonSpinner,
  IonList, IonItem, IonLabel, IonBadge
} from '@ionic/angular/standalone';

import { RetiroService } from 'src/app/services/retiro.service';

@Component({
  selector: 'app-retiro-detalle',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton,
    IonText, IonSpinner,
    IonList, IonItem, IonLabel
],
  templateUrl: './retiro-detalle.page.html',
  styleUrls: ['./retiro-detalle.page.scss']
})
export class RetiroDetallePage implements OnInit {
  loading = false;
  errorMsg = '';

  // 👇 estas propiedades SON las que tu HTML usa
  orden: any = null;
  qrDataUrl: string | null = null;
  copying = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private retiroService: RetiroService
  ) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.loading = true;

    const codigo = this.route.snapshot.paramMap.get('codigo');
    if (!codigo) {
      this.loading = false;
      this.errorMsg = 'Código no encontrado';
      return;
    }

    this.retiroService.buscarPorCodigo(codigo).subscribe({
      next: (data: any) => {
        this.loading = false;
        this.orden = data;

        // si más adelante generas QR como base64
        if (data?.qr_data_url) {
          this.qrDataUrl = data.qr_data_url;
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'No se pudo cargar el retiro';
      }
    });
  }

  // 👈 lo llama el botón del HTML
  back() {
    this.router.navigateByUrl('/pyme/orders');
  }

  // 👈 usado por el botón "Copiar payload"
  async copyPayload() {
    if (!this.orden) return;

    this.copying = true;
    try {
      await navigator.clipboard.writeText(JSON.stringify(this.orden, null, 2));
    } catch (e) {
      console.error('Error copiando payload', e);
    } finally {
      this.copying = false;
    }
  }

  badgeColor(estado: string) {
    switch (estado) {
      case 'ENTREGADO': return 'success';
      case 'EN_TRANSITO': return 'tertiary';
      case 'PREPARADO': return 'primary';
      case 'EN_PREPARACION': return 'warning';
      case 'FALLIDO': return 'danger';
      case 'CANCELADO': return 'medium';
      default: return 'secondary';
    }
  }
}

