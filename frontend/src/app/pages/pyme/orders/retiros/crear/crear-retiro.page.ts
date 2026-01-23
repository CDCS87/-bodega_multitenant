import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonButtons, IonBackButton,
  IonCard, IonCardContent,
  IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
  IonTextarea, IonButton, IonSpinner, IonBadge, IonCardHeader, IonCardTitle, IonText,
  IonGrid, IonRow, IonCol, IonList, IonListHeader, IonItemSliding, IonItemOptions, IonItemOption, IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons'; // Necesario para iconos en Standalone
import { trashOutline, addCircleOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import QRCode from 'qrcode';

// ✅ Importamos tus servicios reales
import { ProductService } from 'src/app/services/product.service';
import { RetiroService } from 'src/app/services/retiro.service';

type RangoRetiro = 'CORTE_1' | 'CORTE_2';

interface RetiroCreatePayload {
  direccion: string;
  comuna: string;
  rango: RangoRetiro;
  referencia?: string;
  observaciones?: string;
  // ✅ Nuevo campo para los productos
  detalles: { producto_id: number; cantidad: number }[];
}

interface RetiroCreado {
  id: string;
  codigo: string;
  rango: RangoRetiro;
  comuna: string;
  direccion: string;
  estado: 'SOLICITADO' | 'ASIGNADO';
  createdAt: string;
}

@Component({
  selector: 'app-pyme-retiro-crear',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle,
    IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
    IonButton, IonBadge,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonList,
    IonItemOptions,
    IonItemOption,
    IonItemSliding,
    IonListHeader
],
  templateUrl: './crear-retiro.page.html',
  styleUrls: ['./crear-retiro.page.scss']
})
export class CrearRetiroPage implements OnInit {
  loading = false;

  // Formulario base
  form = {
    direccion: '',
    comuna: '',
    rango: 'CORTE_1' as RangoRetiro,
    referencia: '',
    observaciones: ''
  };

  // ✅ Lógica de Productos
  productos: any[] = [];      // Inventario completo
  itemsRetiro: any[] = [];    // Carrito de retiro
  
  seleccion = {
    producto_id: null,
    cantidad: 1
  };

  // Resultado
  creado: RetiroCreado | null = null;
  qrDataUrl: string | null = null;

  constructor(
    private router: Router,
    private productService: ProductService,
    private retiroService: RetiroService // Usaremos el servicio real si está disponible
  ) {
    addIcons({ trashOutline, addCircleOutline });
  }

  ngOnInit() {
    this.cargarInventario();
  }

  // 1. Cargar productos desde el Backend
  cargarInventario() {
    this.productService.getProducts().subscribe({
      next: (res: any) => {
        // Ajusta según cómo responda tu API (res o res.productos)
        this.productos = Array.isArray(res) ? res : (res.productos || []);
      },
      error: (err) => console.error('Error cargando inventario', err)
    });
  }

  // 2. Agregar producto a la lista temporal
  agregarItem() {
    if (!this.seleccion.producto_id || this.seleccion.cantidad <= 0) return;

    const prod = this.productos.find(p => p.id === this.seleccion.producto_id);
    if (prod) {
      // Si ya existe, sumamos cantidad
      const existente = this.itemsRetiro.find(i => i.producto_id === this.seleccion.producto_id);
      if (existente) {
        existente.cantidad += this.seleccion.cantidad;
      } else {
        this.itemsRetiro.push({
          producto_id: prod.id,
          nombre: prod.nombre, // Solo visual
          sku: prod.sku,       // Solo visual
          cantidad: this.seleccion.cantidad
        });
      }
      // Reset selección
      this.seleccion = { producto_id: null, cantidad: 1 };
    }
  }

  eliminarItem(index: number) {
    this.itemsRetiro.splice(index, 1);
  }

  rangoLabel(r: RangoRetiro) {
    return r === 'CORTE_1'
      ? 'Corte 1 (11:00) • retiro hoy (tarde)'
      : 'Corte 2 (18:00) • retiro mañana (mañana)';
  }

  // 3. Enviar al Backend
  async submit() {
    // Validaciones
    if (!this.form.direccion.trim() || !this.form.comuna.trim()) {
      alert('Faltan datos de dirección.');
      return;
    }
    if (this.itemsRetiro.length === 0) {
      alert('Debes agregar al menos un producto para retirar.');
      return;
    }

    this.loading = true;
    this.creado = null;
    this.qrDataUrl = null;

    try {
      // Preparamos el payload real
      const payload: RetiroCreatePayload = {
        direccion: this.form.direccion.trim(),
        comuna: this.form.comuna.trim(),
        rango: this.form.rango,
        referencia: this.form.referencia?.trim(),
        observaciones: this.form.observaciones?.trim(),
        detalles: this.itemsRetiro.map(item => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad
        }))
      };

      this.retiroService.crearRetiro(payload).subscribe({
        next: async (res: any) => {
          // Asumimos que el backend devuelve el objeto creado en res o res.retiro
          const retiroResponse = res.retiro || res; 
          
          this.creado = retiroResponse;

          // Generamos QR con el código que viene del backend
          if (this.creado && this.creado.codigo) {
            this.qrDataUrl = await QRCode.toDataURL(this.creado.codigo, {
              margin: 1,
              scale: 8
            });
          }
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          alert('Error al crear la solicitud.');
          this.loading = false;
        }
      });

    } catch (error) {
      console.error(error);
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
            body { font-family: Arial, sans-serif; padding: 24px; text-align: center; }
            .wrap { max-width: 400px; margin: 0 auto; border: 1px dashed #ccc; padding: 20px; }
            img { width: 250px; height: 250px; }
            .code { font-size: 18px; font-weight: bold; margin: 15px 0; }
            .meta { font-size: 14px; color: #666; margin-bottom: 5px; }
            .items { margin-top: 20px; text-align: left; border-top: 1px solid #eee; padding-top: 10px; }
            .item-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
          </style>
        </head>
        <body>
          <div class="wrap">
            <h2>Etiqueta de Retiro</h2>
            <img src="${this.qrDataUrl}" />
            <div class="code">${this.creado.codigo}</div>
            <div class="meta">${this.creado.comuna}</div>
            
            <div class="items">
              <strong>Contenido:</strong>
              ${this.itemsRetiro.map(i => `
                <div class="item-row">
                  <span>${i.nombre}</span>
                  <span>x${i.cantidad}</span>
                </div>
              `).join('')}
            </div>
          </div>
          <script>
            setTimeout(() => window.print(), 500);
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

