import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonItem, IonLabel, IonInput, IonTextarea, IonButton, IonSpinner, IonBadge, IonText, IonGrid, IonRow, IonCol, IonList, IonListHeader, IonItemSliding, IonItemOptions, IonItemOption, IonIcon, IonModal, IonSearchbar, IonSelect, IonSelectOption, IonCardSubtitle } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  trashOutline, 
  addCircleOutline, 
  searchOutline, 
  closeOutline, 
  qrCodeOutline,
  cubeOutline
} from 'ionicons/icons';
import { Router } from '@angular/router';
import QRCode from 'qrcode';

// Servicios
import { ProductService } from 'src/app/services/product.service';
import { RetiroService } from 'src/app/services/retiro.service';

type RangoRetiro = 'CORTE_1' | 'CORTE_2';

@Component({
  selector: 'app-pyme-retiro-crear',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonButtons, IonBackButton,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle,
    IonItem, IonLabel, IonInput, IonButton,
    IonSpinner, IonBadge, IonText,
    IonGrid, IonRow, IonCol, IonList, IonListHeader,
    IonItemSliding, IonItemOptions, IonItemOption, IonIcon,
    IonModal, IonSearchbar, IonSelect, IonSelectOption,
    IonCardSubtitle
],
  templateUrl: './crear-retiro.page.html',
  styleUrls: ['./crear-retiro.page.scss']
})
export class CrearRetiroPage implements OnInit {
  loading = false;

  // Datos del Envío (Dirección)
  form = {
    direccion: '',
    comuna: '',
    rango: 'CORTE_1' as RangoRetiro,
    referencia: '',
    observaciones: ''
  };

  // --- LÓGICA DE PRODUCTOS ---
  productos: any[] = [];           // Inventario completo
  productosFiltrados: any[] = [];  // Para el buscador
  itemsRetiro: any[] = [];         // Carrito final
  
  // Selección temporal
  seleccion = {
    producto: null as any, // Guardamos el objeto completo
    cantidad: 1
  };
  
  isModalOpen = false; // Control del modal de búsqueda

  // --- RESULTADO (QR) ---
  creado: any | null = null;
  qrDataUrl: string | null = null;

  constructor(
    private router: Router,
    private productService: ProductService,
    private retiroService: RetiroService
  ) {
    addIcons({ trashOutline, addCircleOutline, searchOutline, closeOutline, qrCodeOutline, cubeOutline });
  }

  ngOnInit() {
    this.cargarInventario();
  }

  // 1. Cargar Inventario
  cargarInventario() {
    this.productService.getProducts().subscribe({
      next: (res: any) => {
        const lista = Array.isArray(res) ? res : (res.productos || []);
        this.productos = lista;
        this.productosFiltrados = [...lista]; // Inicializamos copia para filtrar
      },
      error: (err) => console.error('Error cargando inventario', err)
    });
  }

  // 2. Lógica del Buscador (Modal)
  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
    // Al abrir, reseteamos el filtro
    if (isOpen) this.productosFiltrados = [...this.productos];
  }

  buscarProducto(event: any) {
    const query = event.target.value.toLowerCase();
    this.productosFiltrados = this.productos.filter(p => 
      p.nombre.toLowerCase().includes(query) || 
      (p.sku && p.sku.toLowerCase().includes(query))
    );
  }

  seleccionarProducto(producto: any) {
    this.seleccion.producto = producto;
    this.setOpen(false); // Cerramos modal
  }

  // 3. Agregar a la Lista (Carrito)
  agregarItem() {
    if (!this.seleccion.producto || this.seleccion.cantidad <= 0) return;

    const prod = this.seleccion.producto;
    
    // Verificar si ya está en la lista
    const existe = this.itemsRetiro.find(i => i.producto_id === prod.id);
    
    if (existe) {
      existe.cantidad += this.seleccion.cantidad;
    } else {
      this.itemsRetiro.push({
        producto_id: prod.id,
        nombre: prod.nombre,
        sku: prod.sku,
        cantidad: this.seleccion.cantidad
      });
    }

    // Limpiar selección
    this.seleccion = { producto: null, cantidad: 1 };
  }

  eliminarItem(index: number) {
    this.itemsRetiro.splice(index, 1);
  }

  // 4. Enviar Solicitud (Guardar y Generar QR)
  async submit() {
    if (!this.form.direccion.trim() || !this.form.comuna.trim()) {
      alert('Faltan datos de dirección.');
      return;
    }
    if (this.itemsRetiro.length === 0) {
      alert('Debes agregar al menos un producto.');
      return;
    }

    this.loading = true;
    this.creado = null;
    this.qrDataUrl = null;

    try {
      const payload = {
        ...this.form,
        direccion: this.form.direccion.trim(),
        comuna: this.form.comuna.trim(),
        referencia: this.form.referencia?.trim(),
        observaciones: this.form.observaciones?.trim(),
        detalles: this.itemsRetiro.map(i => ({
          producto_id: i.producto_id,
          cantidad: i.cantidad
        }))
      };

      // Llamada al servicio
      this.retiroService.crearRetiro(payload).subscribe({
        next: async (res: any) => {
          this.creado = res.retiro || res;
          
          // Generar QR
          if (this.creado && this.creado.codigo) {
            this.qrDataUrl = await QRCode.toDataURL(this.creado.codigo, {
              margin: 1, scale: 8
            });
          }
          this.loading = false;
        },
        error: (err: any) => {
          console.error(err);
          alert('Error al crear la solicitud: ' + (err.error?.message || 'Error desconocido'));
          this.loading = false;
        }
      });

    } catch (error) {
      console.error(error);
      this.loading = false;
    }
  }

  // 5. Imprimir QR
  imprimirQR() {
    if (!this.creado || !this.qrDataUrl) return;
    const w = window.open('', '_blank');
    if (!w) return;

    w.document.write(`
      <html>
        <head>
          <title>Retiro ${this.creado.codigo}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; text-align: center; }
            .box { border: 2px solid #000; padding: 20px; max-width: 400px; margin: 0 auto; }
            img { width: 200px; }
            .code { font-size: 24px; font-weight: bold; margin: 10px 0; }
            .items { text-align: left; margin-top: 20px; border-top: 1px dashed #ccc; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="box">
            <h2>ETIQUETA DE RETIRO</h2>
            <img src="${this.qrDataUrl}" />
            <div class="code">${this.creado.codigo}</div>
            <p><strong>${this.creado.comuna}</strong><br>${this.creado.direccion}</p>
            <div class="items">
              <strong>Contenido:</strong><br>
              ${this.itemsRetiro.map(i => `${i.cantidad}x ${i.nombre}`).join('<br>')}
            </div>
          </div>
          <script>setTimeout(() => window.print(), 500);</script>
        </body>
      </html>
    `);
    w.document.close();
  }

  volver() {
    this.router.navigate(['/pyme/orders']);
  }
}

