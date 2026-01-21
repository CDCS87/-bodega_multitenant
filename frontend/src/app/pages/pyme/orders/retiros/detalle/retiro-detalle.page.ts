import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  IonHeader, IonToolbar, IonContent, IonTitle,
  IonButton, IonText, IonSpinner, IonItem, IonLabel, IonList
} from '@ionic/angular/standalone';

import { RetiroService } from '../../../../services/retiro.service';

// ✅ QR generator
// @ts-ignore
import QRCode from 'qrcode';

@Component({
  selector: 'app-retiro-detalle',
  standalone: true,
  imports: [
    CommonModule,
    IonButton, IonText,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSpinner,
    IonItem,
    IonLabel,
    IonList
],
  templateUrl: './retiro-detalle.page.html',
  styleUrls: ['./retiro-detalle.page.scss']
})
export class RetiroDetallePage implements OnInit {
  loading = false;
  errorMsg = '';

  orden: any = null;

  // ✅ QR visual
  qrDataUrl: string | null = null;
  copying = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private retiroService: RetiroService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.errorMsg = 'ID inválido.';
      return;
    }
    this.load(id);
  }

  load(id: number) {
    this.loading = true;
    this.errorMsg = '';
    this.qrDataUrl = null;

    this.retiroService.getRetiroById(id).subscribe({
      next: async (orden) => {
        this.orden = orden;
        this.loading = false;

        // ✅ Generar QR al cargar
        await this.generateQr();
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'No se pudo cargar la orden';
      }
    });
  }

  async generateQr() {
    try {
      const payload = this.orden?.qr_code;
      if (!payload) {
        this.qrDataUrl = null;
        return;
      }

      // Genera imagen base64 (data URL)
      this.qrDataUrl = await QRCode.toDataURL(payload, {
        errorCorrectionLevel: 'M',
        margin: 1,
        scale: 6
      });
    } catch (e: any) {
      console.error('❌ Error generando QR:', e);
      this.qrDataUrl = null;
    }
  }

  async copyPayload() {
    const payload = this.orden?.qr_code;
    if (!payload) return;

    try {
      this.copying = true;
      await navigator.clipboard.writeText(payload);
    } catch (e) {
      // fallback muy simple
      try {
        const el = document.createElement('textarea');
        el.value = payload;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      } catch (e2) {
        console.error('❌ No se pudo copiar:', e2);
      }
    } finally {
      this.copying = false;
    }
  }

  back() {
    this.router.navigate(['/pyme/retiros'], { replaceUrl: true });
  }
}

