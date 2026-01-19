import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonLabel, IonInput, IonButton,
  IonSegment, IonSegmentButton,
  IonList, IonText, IonSpinner, IonBadge, IonRefresher
} from '@ionic/angular/standalone';

import { DespachoListItem, DespachoService } from '../../../services/despacho.service';

type Segment = 'PENDIENTES' | 'PREPARADOS';

@Component({
  selector: 'app-picking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonItem, IonLabel, IonInput, IonButton,
    IonSegment, IonSegmentButton,
    IonList, IonText, IonSpinner, IonBadge
  ],
  templateUrl: './picking.page.html',
})
export class PickingPage implements OnInit {
  @ViewChild('scannerInput', { static: false })
  scannerInput?: ElementRef<HTMLInputElement>;

  loading = false;
  errorMsg = '';

  // filtros
  segment: Segment = 'PENDIENTES';
  q = '';
  scan = '';

  // data
  despachos: DespachoListItem[] = [];
  filtered: DespachoListItem[] = [];

  constructor(
    private despachoService: DespachoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.load();
  }

  ionViewDidEnter() {
    // PC con pistola USB: que siempre quede enfocado
    setTimeout(() => this.focusScannerInput(), 250);
  }

  focusScannerInput() {
    const el = this.scannerInput?.nativeElement;
    if (el) el.focus();
  }

  load(ev?: any) {
    this.errorMsg = '';
    this.loading = true;

    this.despachoService.getDespachos().subscribe({
      next: (rows) => {
        this.despachos = rows || [];
        this.applyFilter();
        this.loading = false;
        ev?.target?.complete?.();
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'No se pudieron cargar los despachos';
        ev?.target?.complete?.();
      }
    });
  }

  onSegmentChange() {
    this.applyFilter();
  }

  applyFilter() {
    const needle = (this.q || '').trim().toLowerCase();

    this.filtered = (this.despachos || [])
      .filter(o => {
        // segmento
        const isPend = o.estado === 'SOLICITADO' || o.estado === 'EN_PICKING';
        const isPrep = o.estado === 'PREPARADO';

        if (this.segment === 'PENDIENTES' && !isPend) return false;
        if (this.segment === 'PREPARADOS' && !isPrep) return false;

        // texto
        if (!needle) return true;

        return (
          (o.codigo || '').toLowerCase().includes(needle) ||
          (o.destinatario_nombre || '').toLowerCase().includes(needle) ||
          (o.comuna || '').toLowerCase().includes(needle)
        );
      });
  }

  open(id: number) {
    this.router.navigate(['/bodega/picking/detalle', id]);
  }

  buscarPorScan() {
    const raw = (this.scan || '').trim();
    if (!raw) return;

    const clean = raw.replace(/\r?\n/g, '').trim();
    this.scan = '';

    this.loading = true;
    this.errorMsg = '';

    this.despachoService.scanDespacho(clean).subscribe({
      next: (orden) => {
        this.loading = false;
        if (orden?.id) this.open(orden.id);
        this.focusScannerInput();
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'No existe despacho para ese código';
        this.focusScannerInput();
      }
    });
  }

  /**
   * 📷 Escaneo con cámara (Móvil)
   * Usa @capacitor-mlkit/barcode-scanning
   * Si no está disponible (web/PC), cae al input (pistola USB).
   */
  async scanConCamara() {
    try {
      const mod: any = await import('@capacitor-mlkit/barcode-scanning').catch(() => null);
      const BarcodeScanner = mod?.BarcodeScanner;

      // Si estás en web o no existe el plugin, usar input
      if (!BarcodeScanner) {
        this.focusScannerInput();
        return;
      }

      const perm = await BarcodeScanner.requestPermissions();
      if (perm.camera !== 'granted') {
        this.errorMsg = 'Permiso de cámara denegado';
        this.focusScannerInput();
        return;
      }

      const result = await BarcodeScanner.scan();
      const raw = result?.barcodes?.[0]?.rawValue;

      if (raw) {
        this.scan = raw;      // opcional: lo deja visible
        this.buscarPorScan(); // reutiliza tu flujo
      } else {
        this.focusScannerInput();
      }

    } catch (e) {
      console.error(e);
      this.errorMsg = 'No se pudo abrir la cámara para escanear';
      this.focusScannerInput();
    }
  }

  estadoColor(estado: string) {
    switch (estado) {
      case 'SOLICITADO': return 'warning';
      case 'EN_PICKING': return 'tertiary';
      case 'PREPARADO': return 'success';
      default: return 'medium';
    }
  }
}



