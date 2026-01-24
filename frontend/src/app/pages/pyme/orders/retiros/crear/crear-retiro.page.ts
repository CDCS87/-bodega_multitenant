import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonButtons, IonBackButton,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonItem, IonLabel, IonInput, IonButton,
  IonSpinner, IonBadge,
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

// Librería de QR (Asegúrate de tenerla instalada)
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
        // console.log('🚨 DATOS RECIBIDOS DEL BACKEND:', pyme);
        this.pymeData = pyme;
        // Si el switch está activo al cargar, llenamos automáticamente
        if (this.usarDireccionRegistrada) {
          this.llenarDireccionConPyme();
        }
      },
      error: (err) => console.error('No se pudo cargar la Pyme', err)
    });
  }

  toggleDireccion() {
    if (this.usarDireccionRegistrada) {
      // Activa: Rellenamos ambos campos desde la Pyme
      this.llenarDireccionConPyme();
    } else {
      // Desactiva: Limpiamos ambos campos para ingreso manual
      this.form.direccion = '';
      this.form.comuna = '';
    }
  }

  private llenarDireccionConPyme() {
    if (this.pymeData) {
      this.form.direccion = this.pymeData.direccionPyme || ''; 
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

  // --- 3. ENVIAR SOLICITUD Y GENERAR QR ---
  async submit() {
    // Validaciones básicas
    if (!this.form.direccion.trim() || !this.form.comuna.trim()) {
      alert('Faltan datos de dirección o comuna.');
      return;
    }
    if (this.itemsRetiro.length === 0) {
      alert('Debes agregar al menos un producto.');
      return;
    }

    this.loading = true;

    // Preparamos el payload
    const payload = {
      ...this.form,
      direccion: this.form.direccion.trim(),
      comuna: this.form.comuna.trim(),
      // Enviamos referencia y rango aunque el backend los junte en observaciones
      referencia: this.form.referencia?.trim(), 
      observaciones: this.form.observaciones?.trim(),
      detalles: this.itemsRetiro.map(i => ({
        producto_id: i.producto_id,
        cantidad: i.cantidad
      }))
    };

    this.retiroService.crearRetiro(payload).subscribe({
      next: async (res: any) => {
        // Obtenemos el objeto retiro creado
        this.creado = res.retiro || res;

        // Generamos el QR si tenemos código
        if (this.creado && this.creado.codigo) {
          try {
            // Configuración óptima para lectura logística
            this.qrDataUrl = await QRCode.toDataURL(this.creado.codigo, { 
              errorCorrectionLevel: 'H', // Alta redundancia (se lee aunque se rompa un poco)
              margin: 2,
              width: 300,
              color: {
                dark: '#000000',
                light: '#ffffff'
              }
            });
            console.log('✅ QR Generado:', this.creado.codigo);
          } catch (qrErr) {
            console.error('❌ Error generando imagen QR', qrErr);
          }
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        alert('Error: ' + (err.error?.message || 'No se pudo crear el retiro'));
        this.loading = false;
      }
    });
  }

  // --- 4. IMPRIMIR ETIQUETA ---
  imprimirQR() {
    if (!this.creado || !this.qrDataUrl) return;
    
    // Abrimos ventana para impresión
    const w = window.open('', '_blank');
    if (!w) {
      alert('Por favor permite las ventanas emergentes para imprimir.');
      return;
    }

    w.document.write(`
      <html>
        <head>
          <title>Etiqueta ${this.creado.codigo}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; text-align: center; }
            .box { 
              border: 3px solid #000; 
              padding: 15px; 
              max-width: 350px; 
              margin: 0 auto; 
              border-radius: 10px;
            }
            img { width: 180px; height: 180px; }
            .title { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
            .code { font-size: 28px; font-weight: 900; margin: 5px 0; letter-spacing: 2px; }
            .info { font-size: 14px; margin-bottom: 15px; border-bottom: 2px solid #000; padding-bottom: 10px;}
            .items { text-align: left; font-size: 12px; }
            .footer { font-size: 10px; margin-top: 20px; color: #666; }
          </style>
        </head>
        <body>
          <div class="box">
            <div class="title">${this.pymeData?.nombrePyme || 'BODEGA MULTITENANT'}</div>
            
            <img src="${this.qrDataUrl}" />
            
            <div class="code">${this.creado.codigo}</div>
            
            <div class="info">
              <strong>DESTINO:</strong> BOD. CENTRAL<br>
              <strong>ORIGEN:</strong> ${this.creado.comuna}<br>
              <small>${this.creado.direccion}</small>
            </div>

            <div class="items">
              <strong>CONTENIDO (${this.itemsRetiro.length} Items):</strong><br>
              ${this.itemsRetiro.map(i => `• [${i.cantidad}] ${i.nombre}`).join('<br>')}
            </div>
            
            <div class="footer">
              Generado: ${new Date().toLocaleString()}
            </div>
          </div>
          <script>
            // Imprime automáticamente y cierra al terminar
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); }
            }
          </script>
        </body>
      </html>
    `);
    w.document.close();
  }

  volver() {
    this.router.navigate(['/pyme/orders']);
  }
}