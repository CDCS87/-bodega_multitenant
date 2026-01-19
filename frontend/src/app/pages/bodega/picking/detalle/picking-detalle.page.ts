import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCheckbox,
  IonChip,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonProgressBar,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  IonSpinner,
  IonTitle,
  IonToolbar,
  LoadingController,
  ToastController, IonText } from '@ionic/angular/standalone';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  scanOutline,
  playOutline,
  flagOutline,
  saveOutline,
  warningOutline,
  cubeOutline,
  closeCircleOutline,
} from 'ionicons/icons';

type PickingEstado = 'PENDIENTE' | 'EN_PROCESO' | 'FINALIZADO' | 'CANCELADO';

interface PickingItem {
  id: string;
  sku?: string;
  nombre: string;
  unidad?: string;
  ubicacion?: string; // pasillo/rack/bin
  lote?: string;
  vencimiento?: string; // ISO
  barcode?: string;

  cantidadRequerida: number;
  cantidadPickeada: number;

  ok: boolean; // marcado completo
  observacion?: string;
}

interface PickingDetalle {
  id: string;
  codigo?: string; // codigo/QR retiro o picking
  estado: PickingEstado;

  createdAt?: string; // ISO
  startedAt?: string; // ISO
  finishedAt?: string; // ISO

  bodega?: string;
  pymeNombre?: string;
  destino?: string;

  items: PickingItem[];

  nota?: string;
}

@Component({
  selector: 'app-picking-detalle',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonChip,
    IonBadge,
    IonItem,
    IonLabel,
    IonNote,
    IonList,
    IonCheckbox,
    IonInput,
    IonButton,
    IonIcon,
    IonProgressBar,
    IonRefresher,
    IonRefresherContent,
    IonFooter,
    IonSkeletonText,
  ],
  templateUrl: './picking-detalle.page.html',
  styleUrls: ['./picking-detalle.page.scss'],
})
export class PickingDetallePage {
  private readonly apiBase = '/api'; // 👈 ajusta si usas environment.apiUrl

  pickingId = '';
  loading = signal(true);
  saving = signal(false);

  detalle = signal<PickingDetalle | null>(null);

  // UI helpers
  totalItems = computed(() => this.detalle()?.items?.length ?? 0);
  totalRequerido = computed(() =>
    (this.detalle()?.items ?? []).reduce((acc, it) => acc + (it.cantidadRequerida ?? 0), 0)
  );
  totalPickeado = computed(() =>
    (this.detalle()?.items ?? []).reduce((acc, it) => acc + (it.cantidadPickeada ?? 0), 0)
  );
  progreso = computed(() => {
    const req = this.totalRequerido();
    if (!req) return 0;
    return Math.min(1, this.totalPickeado() / req);
  });
  completado = computed(() => {
    const d = this.detalle();
    if (!d) return false;
    return d.items.every(it => (it.cantidadPickeada ?? 0) >= (it.cantidadRequerida ?? 0));
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {
    addIcons({
      scanOutline,
      checkmarkCircleOutline,
      playOutline,
      flagOutline,
      saveOutline,
      warningOutline,
      cubeOutline,
      closeCircleOutline,
    });
  }

  async ionViewWillEnter() {
    this.pickingId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.pickingId) {
      await this.presentToast('Falta el ID del picking.', 'danger');
      this.router.navigateByUrl('/picking');
      return;
    }
    await this.cargarDetalle();
  }

  async cargarDetalle(ev?: CustomEvent) {
    this.loading.set(true);
    try {
      const data = await firstValueFrom(
        this.http.get<PickingDetalle>(`${this.apiBase}/picking/${this.pickingId}`)
      );

      // normaliza por si viene null/undefined
      data.items = (data.items ?? []).map(it => ({
        ...it,
        cantidadPickeada: Number(it.cantidadPickeada ?? 0),
        cantidadRequerida: Number(it.cantidadRequerida ?? 0),
        ok: Boolean(it.ok ?? false),
      }));

      this.detalle.set(data);
    } catch (e) {
      this.handleHttpError(e);
    } finally {
      this.loading.set(false);
      if (ev) (ev.target as HTMLIonRefresherElement).complete();
    }
  }

  // ===== Acciones de estado =====
  async iniciarPicking() {
    const d = this.detalle();
    if (!d) return;

    if (d.estado !== 'PENDIENTE') {
      await this.presentToast('Este picking ya fue iniciado.', 'medium');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Iniciando...' });
    await loading.present();

    try {
      const updated = await firstValueFrom(
        this.http.patch<PickingDetalle>(`${this.apiBase}/picking/${this.pickingId}/start`, {})
      );
      this.detalle.set({ ...d, ...updated });
      await this.presentToast('Picking iniciado ✅', 'success');
    } catch (e) {
      this.handleHttpError(e);
    } finally {
      loading.dismiss();
    }
  }

  async finalizarPicking() {
    const d = this.detalle();
    if (!d) return;

    if (d.estado === 'FINALIZADO') {
      await this.presentToast('Este picking ya está finalizado.', 'medium');
      return;
    }

    if (!this.completado()) {
      const alert = await this.alertCtrl.create({
        header: 'Faltan unidades',
        message:
          'Aún hay ítems con cantidad pickeada menor a la requerida. ¿Quieres finalizar igual?',
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Finalizar igual',
            role: 'destructive',
            handler: async () => this.confirmarFinalizacion(),
          },
        ],
      });
      await alert.present();
      return;
    }

    await this.confirmarFinalizacion();
  }

  private async confirmarFinalizacion() {
    const loading = await this.loadingCtrl.create({ message: 'Finalizando...' });
    await loading.present();

    try {
      const updated = await firstValueFrom(
        this.http.post<PickingDetalle>(`${this.apiBase}/picking/${this.pickingId}/finish`, {})
      );
      const current = this.detalle();
      this.detalle.set({ ...(current ?? ({} as any)), ...updated, estado: 'FINALIZADO' });
      await this.presentToast('Picking finalizado ✅', 'success');
    } catch (e) {
      this.handleHttpError(e);
    } finally {
      loading.dismiss();
    }
  }

  // ===== Edición de ítems =====
  setPickQty(item: PickingItem, value: any) {
    const d = this.detalle();
    if (!d) return;

    const n = Math.max(0, Number(value ?? 0));
    item.cantidadPickeada = n;
    item.ok = n >= item.cantidadRequerida;

    this.detalle.set({
      ...d,
      items: d.items.map(it => (it.id === item.id ? { ...item } : it)),
    });
  }

  inc(item: PickingItem) {
    this.setPickQty(item, (item.cantidadPickeada ?? 0) + 1);
  }

  dec(item: PickingItem) {
    this.setPickQty(item, Math.max(0, (item.cantidadPickeada ?? 0) - 1));
  }

  async agregarObservacion(item: PickingItem) {
    const alert = await this.alertCtrl.create({
      header: 'Observación',
      inputs: [
        {
          name: 'obs',
          type: 'textarea',
          placeholder: 'Ej: faltó stock, producto dañado, cambio de lote...',
          value: item.observacion ?? '',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            const d = this.detalle();
            if (!d) return;
            item.observacion = (data?.obs ?? '').trim();

            this.detalle.set({
              ...d,
              items: d.items.map(it => (it.id === item.id ? { ...item } : it)),
            });
          },
        },
      ],
    });

    await alert.present();
  }

  // ===== Guardado =====
  async guardarBorrador() {
    const d = this.detalle();
    if (!d) return;

    if (d.estado === 'FINALIZADO') {
      await this.presentToast('No puedes editar un picking finalizado.', 'medium');
      return;
    }

    this.saving.set(true);
    try {
      // envía estado actual de items (cantidadPickeada, ok, observacion)
      const payload = {
        items: d.items.map(it => ({
          id: it.id,
          cantidadPickeada: it.cantidadPickeada,
          ok: it.ok,
          observacion: it.observacion ?? null,
        })),
      };

      const updated = await firstValueFrom(
        this.http.patch<PickingDetalle>(`${this.apiBase}/picking/${this.pickingId}`, payload)
      );

      // si backend no devuelve items completos, mantenemos los del front
      this.detalle.set({
        ...d,
        ...updated,
        items: updated.items?.length ? updated.items : d.items,
      });

      await this.presentToast('Borrador guardado 💾', 'success');
    } catch (e) {
      this.handleHttpError(e);
    } finally {
      this.saving.set(false);
    }
  }

  // ===== Scan (sin plugin, modo manual) =====
  async scanItem(item?: PickingItem) {
    const alert = await this.alertCtrl.create({
      header: 'Escanear / Ingresar código',
      message: item
        ? `Ingresa el código para confirmar: <b>${item.nombre}</b>`
        : 'Ingresa el código para buscar un ítem dentro del picking.',
      inputs: [
        {
          name: 'code',
          type: 'text',
          placeholder: 'EAN / SKU / Código interno',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'OK',
          handler: async (data) => {
            const code = String(data?.code ?? '').trim();
            if (!code) return;

            const d = this.detalle();
            if (!d) return;

            // match simple: barcode o sku
            const found =
              item ??
              d.items.find(it => (it.barcode && it.barcode === code) || (it.sku && it.sku === code));

            if (!found) {
              await this.presentToast('No encontré ese código en este picking.', 'warning');
              return;
            }

            // suma 1 por scan
            this.inc(found);
            await this.presentToast(`+1 a "${found.nombre}"`, 'success');
          },
        },
      ],
    });

    await alert.present();
  }

  // ===== Util =====
  estadoColor(estado: PickingEstado) {
    switch (estado) {
      case 'PENDIENTE':
        return 'medium';
      case 'EN_PROCESO':
        return 'primary';
      case 'FINALIZADO':
        return 'success';
      case 'CANCELADO':
        return 'danger';
      default:
        return 'medium';
    }
  }

  private async presentToast(message: string, color: 'success' | 'danger' | 'warning' | 'medium' | 'primary' = 'medium') {
    const t = await this.toastCtrl.create({
      message,
      duration: 1600,
      position: 'bottom',
      color,
    });
    await t.present();
  }

  private handleHttpError(err: unknown) {
    let msg = 'Error inesperado.';
    if (err instanceof HttpErrorResponse) {
      msg = err.error?.message || err.message || `HTTP ${err.status}`;
    }
    this.presentToast(msg, 'danger');
  }
}

