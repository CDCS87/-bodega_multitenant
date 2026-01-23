import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonButtons, IonBackButton,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonItem, IonLabel, IonInput, IonTextarea, IonButton, 
  IonSpinner, IonBadge, IonText,
  IonGrid, IonRow, IonCol, IonList, IonListHeader, 
  IonItemSliding, IonItemOptions, IonItemOption, IonIcon,
  IonModal, IonSearchbar, IonSelect, IonSelectOption,
  IonToggle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  trashOutline, addCircleOutline, searchOutline, 
  closeOutline, qrCodeOutline, cubeOutline, 
  printOutline, checkmarkCircle 
} from 'ionicons/icons';
import { Router } from '@angular/router';
import QRCode from 'qrcode';

// Servicios
import { ProductService } from 'src/app/services/product.service';
import { RetiroService } from 'src/app/services/retiro.service';
import { AuthService } from 'src/app/services/auth.service';

type RangoRetiro = 'CORTE_1' | 'CORTE_2';

@Component({
  selector: 'app-pyme-retiro-crear',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonButtons, IonBackButton,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle,
    IonItem, IonLabel, IonInput, IonButton,
    IonSpinner, IonBadge,
    IonGrid, IonRow, IonCol, IonList, IonListHeader,
    IonItemSliding, IonItemOptions, IonItemOption, IonIcon,
    IonModal, IonSearchbar, IonSelect, IonSelectOption,
    IonToggle
],
  templateUrl: './crear-retiro.page.html',
  styleUrls: ['./crear-retiro.page.scss']
})
export class CrearRetiroPage implements OnInit {
  loading = false;

  // Datos Pyme (Caché)
  pymeData: any = null;
  
  // Switch: Inicia activado para cargar la dirección automáticamente
  usarDireccionRegistrada = true; 

  // Formulario
  form = {
    direccion: '',
    comuna: '',
    rango: 'CORTE_1' as RangoRetiro,
    referencia: '',
    observaciones: ''
  };

  // Productos
  productos: any[] = [];           
  productosFiltrados: any[] = [];  
  itemsRetiro: any[] = [];         
  
  seleccion = {
    producto: null as any, 
    cantidad: 1
  };
  
  isModalOpen = false;

  // Resultado
  creado: any | null = null;
  qrDataUrl: string | null = null;

  constructor(
    private router: Router,
    private productService: ProductService,
    private retiroService: RetiroService,
    private authService: AuthService
  ) {
    addIcons({ trashOutline, addCircleOutline, searchOutline, closeOutline, qrCodeOutline, cubeOutline, printOutline, checkmarkCircle });
  }

  ngOnInit() {
    this.cargarInventario();
    this.cargarDatosPyme();
  }

  // --- 1. LÓGICA DE DATOS PYME ---
  cargarDatosPyme() {
    this.authService.getMyPyme().subscribe({
      next: (pyme) => {
        this.pymeData = pyme;
        // Si el switch está activo al cargar, llenamos el formulario
        if (this.usarDireccionRegistrada) {
          this.llenarDireccionConPyme();
        }
      },
      error: (err) => console.error('No se pudo cargar la Pyme', err)
    });
  }

  toggleDireccion() {
    // Si activa el switch, sobrescribimos con los datos guardados
    if (this.usarDireccionRegistrada) {
      this.llenarDireccionConPyme();
    } else {
      // Si lo desactiva, limpiamos para que el usuario escriba
      this.form.direccion = '';
      this.form.comuna = '';
    }
  }

  private llenarDireccionConPyme() {
    if (this.pymeData) {
      // ✅ CORRECCIÓN IMPORTANTE: Usamos 'pymeDireccion' (el alias del backend)
      this.form.direccion = this.pymeData.pymeDireccion || ''; 
      this.form.comuna = this.pymeData.comuna || '';
    }
  }

  // --- 2. LÓGICA DE PRODUCTOS ---
  cargarInventario() {
    this.productService.getProducts().subscribe({
      next: (res: any) => {
        const lista = Array.isArray(res) ? res : (res.productos || []);
        this.productos = lista;
        this.productosFiltrados = [...lista];
      }
    });
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
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
    this.setOpen(false);
  }

  agregarItem() {
    if (!this.seleccion.producto || this.seleccion.cantidad <= 0) return;
    const prod = this.seleccion.producto;
    
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
    this.seleccion = { producto: null, cantidad: 1 };
  }

  eliminarItem(index: number) {
    this.itemsRetiro.splice(index, 1);
  }

  // --- 3. ENVIAR SOLICITUD ---
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
    try {
      const payload = {
        ...this.form,
        // Eliminamos espacios en blanco accidentales
        direccion: this.form.direccion.trim(),
        comuna: this.form.comuna.trim(),
        referencia: this.form.referencia?.trim(),
        observaciones: this.form.observaciones?.trim(),
        // Detalle de productos
        detalles: this.itemsRetiro.map(i => ({
          producto_id: i.producto_id,
          cantidad: i.cantidad
        }))
      };

      // ✅ Usamos createRetiro (o crearRetiro según tu servicio)
      this.retiroService.crearRetiro(payload).subscribe({
        next: async (res: any) => {
          this.creado = res.retiro || res;
          if (this.creado && this.creado.codigo) {
            this.qrDataUrl = await QRCode.toDataURL(this.creado.codigo, { margin: 1, scale: 8 });
          }
          this.loading = false;
        },
        error: (err) => {
          alert('Error: ' + (err.error?.message || 'Error desconocido'));
          this.loading = false;
        }
      });
    } catch (error) {
      console.error(error);
      this.loading = false;
    }
  }

  // --- 4. IMPRIMIR QR ---
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
            <p><strong>${this.pymeData?.pymeNombre || 'Pyme'}</strong></p>
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