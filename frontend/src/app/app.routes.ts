import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonList, IonItem,
  IonLabel, IonBadge, IonSearchbar, IonRefresher, IonRefresherContent, IonInput,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { qrCodeOutline, searchOutline } from 'ionicons/icons';
import { DespachoListItem, DespachoService } from './services/despacho.service';

@Component({
  selector: 'app-picking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
],
  template: ''
})
export class PickingPage implements OnInit {
  @ViewChild('scannerInput', { static: false }) scannerInput?: ElementRef<HTMLInputElement>;

  loading = false;

  // listado completo + filtrado
  despachos: DespachoListItem[] = [];
  filtered: DespachoListItem[] = [];

  // buscador normal + input para pistola/QR
  q = '';
  scanValue = '';

  constructor(
    private despachoService: DespachoService,
    private router: Router
  ) {
    addIcons({ qrCodeOutline, searchOutline });
  }

  ngOnInit() {
    this.load();
  }

  ionViewDidEnter() {
    // enfoca el input “wedge” para que la pistola USB dispare directo
    setTimeout(() => this.focusScannerInput(), 250);
  }

  async load(ev?: any) {
    this.loading = true;
    this.despachoService.getDespachos().subscribe({
      next: (rows) => {
        // BODEGA ve estados SOLICITADO / EN_PICKING (según tu backend)
        this.despachos = rows || [];
        this.applyFilter();
        this.loading = false;
        ev?.target?.complete?.();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        ev?.target?.complete?.();
      }
    });
  }

  applyFilter() {
    const needle = (this.q || '').trim().toLowerCase();
    this.filtered = this.despachos
      .filter(d => !needle || d.codigo?.toLowerCase().includes(needle) || String(d.id).includes(needle))
      .slice();
  }

  onSearchChange(value: string) {
    this.q = value ?? '';
    this.applyFilter();
  }

  openDetalle(id: number) {
    this.router.navigate(['/bodega/picking/detalle', id]);
  }

  focusScannerInput() {
    const el = this.scannerInput?.nativeElement;
    if (el) el.focus();
  }

  // ENTER en el input wedge
  onWedgeEnter() {
    const raw = (this.scanValue || '').trim();
    if (!raw) return;

    // algunas pistolas meten \n al final
    const clean = raw.replace(/\r?\n/g, '').trim();
    this.scanValue = '';

    this.buscarPorCodigo(clean);
  }

  buscarPorCodigo(codigoOrQr: string) {
    this.loading = true;
    this.despachoService.scanDespacho(codigoOrQr).subscribe({
      next: (orden) => {
        this.loading = false;
        if (orden?.id) this.openDetalle(orden.id);
        this.focusScannerInput();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.focusScannerInput();
      }
    });
  }

  // Escaneo por cámara (si existe plugin instalado).
  // Si no existe, igual funciona con pistola USB / input.
  async scanConCamara() {
    try {
      // Import dinámico para que compile aunque no esté instalado
      // @ts-ignore
      const mod: any = await import('@capacitor-community/barcode-scanner').catch(() => null);
      const BarcodeScanner = mod?.BarcodeScanner;
      if (!BarcodeScanner) {
        // fallback: enfocar input para pistola
        this.focusScannerInput();
        return;
      }

      await BarcodeScanner.checkPermission({ force: true });
      await BarcodeScanner.hideBackground();

      const result = await BarcodeScanner.startScan();

      BarcodeScanner.showBackground();
      BarcodeScanner.stopScan();

      if (result?.hasContent) {
        this.buscarPorCodigo(result.content);
      } else {
        this.focusScannerInput();
      }
    } catch (e) {
      console.error(e);
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


