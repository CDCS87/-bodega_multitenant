import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonButtons, IonBackButton,
  IonCard, IonCardContent,
  IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
  IonTextarea, IonButton, IonSpinner, IonBadge
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import QRCode from 'qrcode';

type RangoRetiro = 'CORTE_1' | 'CORTE_2';

interface RetiroCreatePayload {
  direccion: string;
  comuna: string;
  rango: RangoRetiro;
  referencia?: string;
  observaciones?: string;
}

interface RetiroCreado {
  id: string;
  codigo: string; // lo que va en QR
  rango: RangoRetiro;
  comuna: string;
  direccion: string;
  estado: 'SOLICITADO' | 'ASIGNADO';
  transportista?: { id: string; nombre: string };
  createdAt: string; // ISO
}

@Component({
  selector: 'app-pyme-retiro-crear',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonButtons, IonBackButton,
    IonCard, IonCardContent,
    IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
    IonTextarea, IonButton, IonSpinner, IonBadge
  ],
  templateUrl: './crear-retiro.page.html',
  styleUrls: ['./crear-retiro.page.scss']
})
export class CrearRetiroPage {
  loading = false;

  form: RetiroCreatePayload = {
    direccion: '',
    comuna: '',
    rango: 'CORTE_1',
    referencia: '',
    observaciones: ''
  };

  // Resultado
  creado: RetiroCreado | null = null;
  qrDataUrl: string | null = null;

  constructor(private router: Router) {}

  // UI helper: texto del rango según informe (ajusta wording si quieres)
  rangoLabel(r: RangoRetiro) {
    return r === 'CORTE_1'
      ? 'Corte 1 (11:00) • retiro hoy (tarde)'
      : 'Corte 2 (18:00) • retiro mañana (mañana)';
  }

  // ✅ aquí más adelante llamas tu backend real
  private async crearRetiroAPI(payload: RetiroCreatePayload): Promise<RetiroCreado> {
    // MOCK: simula asignación por zona + rango
    const assigned = Math.random() > 0.2;

    const id = crypto?.randomUUID?.() ?? String(Date.now());
    const codigoBase = `PYME-001-RET-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(Math.floor(Math.random()*9999)).padStart(4,'0')}`;

    return {
      id,
      codigo: `RET|${codigoBase}`,
      rango: payload.rango,
      comuna: payload.comuna,
      direccion: payload.direccion,
      estado: assigned ? 'ASIGNADO' : 'SOLICITADO',
      transportista: assigned ? { id: 'T-01', nombre: 'Transportes Norte' } : undefined,
      createdAt: new Date().toISOString()
    };
  }

  async submit() {
    if (!this.form.direccion.trim() || !this.form.comuna.trim()) return;

    this.loading = true;
    this.creado = null;
    this.qrDataUrl = null;

    try {
      const retiro = await this.crearRetiroAPI({
        ...this.form,
        direccion: this.form.direccion.trim(),
        comuna: this.form.comuna.trim(),
        referencia: this.form.referencia?.trim(),
        observaciones: this.form.observaciones?.trim()
      });

      this.creado = retiro;

      // genera QR (dataURL)
      this.qrDataUrl = await QRCode.toDataURL(retiro.codigo, {
        margin: 1,
        scale: 8
      });
    } finally {
      this.loading = false;
    }
  }

  imprimirQR() {
    if (!this.creado || !this.qrDataUrl) return;

    const w = window.open('', '_blank');
    if (!w) return;

    const title = `Retiro ${this.creado.codigo}`;
    w.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            .wrap { max-width: 420px; margin: 0 auto; text-align: center; }
            img { width: 280px; height: 280px; }
            .code { font-size: 14px; margin-top: 10px; word-break: break-all; }
            .meta { opacity: 0.8; margin-top: 6px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="wrap">
            <h2>QR Retiro</h2>
            <img src="${this.qrDataUrl}" />
            <div class="code">${this.creado.codigo}</div>
            <div class="meta">${this.creado.comuna} • ${this.creado.direccion}</div>
            <div class="meta">${this.rangoLabel(this.creado.rango)}</div>
          </div>
          <script>
            setTimeout(() => window.print(), 250);
          </script>
        </body>
      </html>
    `);
    w.document.close();
  }

  volverAOrdenes() {
    this.router.navigateByUrl('/pyme/orders');
  }
}

