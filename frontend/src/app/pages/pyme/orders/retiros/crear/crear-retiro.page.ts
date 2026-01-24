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
  IonToggle, AlertController
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
    IonList, IonListHeader,
    IonItemSliding, IonItemOptions, IonItemOption, IonIcon,
    IonSelect, IonSelectOption,
    IonToggle,
    IonModal,
    IonSearchbar
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
    private authService: AuthService,
    private alertController: AlertController
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

    // Filtramos la lista local
    this.productosFiltrados = this.productos.filter(p => {
      // 1. Obtenemos los valores en minúsculas (usamos '' si vienen vacíos para que no de error)
      const nombre = p.nombre ? p.nombre.toLowerCase() : '';
      const sku = p.sku ? p.sku.toLowerCase() : '';
      const barras = p.codigo_barras ? p.codigo_barras.toLowerCase() : ''; // <--- NUEVO CAMPO

      // 2. Revisamos si lo que escribiste está en ALGUNO de los 3
      return nombre.includes(query) || 
             sku.includes(query) || 
             barras.includes(query);
    });
  }

  // 2. Nueva función directa (Reemplaza a seleccionarProducto anterior)
  async seleccionarProducto(producto: any) {
    // 1. Cerramos el buscador
    this.setOpen(false);

    // 2. Definimos qué mostrar: Prioridad Barra -> luego SKU
    // (Asegúrate que tu campo en BD se llame 'codigo_barras', si es 'barcode' cámbialo aquí)
    const codigoMostrar = producto.codigo_barras || producto.sku || 'Sin código';

    // 3. Creamos la alerta
    const alert = await this.alertController.create({
      header: `Agregar ${producto.nombre}`,
      subHeader: `Código: ${codigoMostrar}`, // <--- AQUÍ MOSTRAMOS EL DATO
      inputs: [
        {
          name: 'cantidad',
          type: 'number',
          placeholder: 'Ej: 10',
          min: 1,
          attributes: {
            inputmode: 'numeric',
            autofocus: true
          }
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Agregar',
          handler: (data) => {
            const cantidad = parseInt(data.cantidad, 10);
            
            if (cantidad && cantidad > 0) {
              this.seleccion.producto = producto;
              this.seleccion.cantidad = cantidad;
              this.agregarItem();
              return true;
            } else {
              return false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // Agrega el producto seleccionado a la lista de items del retiro
  agregarItem() {
    const producto = this.seleccion.producto;
    const cantidad = this.seleccion.cantidad;
    if (!producto || !cantidad || cantidad < 1) return;

    // Verifica si el producto ya está en la lista
    const existente = this.itemsRetiro.find(i => i.producto_id === producto.id);
    if (existente) {
      existente.cantidad += cantidad;
    } else {
      this.itemsRetiro.push({
        producto_id: producto.id,
        nombre: producto.nombre,
        sku: producto.sku,
        cantidad: cantidad
      });
    }
    // Limpia la selección
    this.seleccion.producto = null;
    this.seleccion.cantidad = 1;
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
        console.log('📦 Respuesta Backend:', res)
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

  // --- NUEVA FUNCIÓN: Se llama solo cuando el usuario quiere hacer OTRO retiro ---
  nuevaSolicitud() {
    this.creado = null;
    this.qrDataUrl = null;
    this.itemsRetiro = []; // Ahora sí limpiamos los productos
    this.form.observaciones = '';
    this.form.referencia = '';
    // Mantenemos dirección y comuna por comodidad
  }

  // --- 4. IMPRIMIR ETIQUETA ---
  imprimirQR() {
    if (!this.creado || !this.qrDataUrl) return;

    const ventana = window.open('', '_blank');
    if (!ventana) {
      alert('Permite las ventanas emergentes para imprimir.');
      return;
    }

    // HTML para la IMPRESORA (Etiqueta física)
    ventana.document.write(`
      <html>
        <head>
          <title>Etiqueta ${this.creado.codigo}</title>
          <style>
            body { font-family: monospace; width: 300px; margin: 0 auto; text-align: center; padding: 10px; }
            .box { border: 2px solid black; padding: 10px; border-radius: 8px; }
            h1 { font-size: 22px; margin: 5px 0; }
            .qr-img { width: 180px; height: 180px; }
            .code { font-size: 18px; font-weight: bold; margin: 10px 0; border: 1px solid #ccc; padding: 5px; }
            .details { text-align: left; font-size: 12px; border-top: 1px dashed black; margin-top: 10px; padding-top: 5px; }
            .item-row { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="box">
            <h1>ORDEN DE RETIRO</h1>
            <p><strong>${this.pymeData?.nombrePyme || 'Pyme'}</strong></p>
            
            <img src="${this.qrDataUrl}" class="qr-img"/>
            
            <div class="code">${this.creado.codigo}</div>
            
            <div class="details">
              <strong>DETALLE (${this.itemsRetiro.length} ítems):</strong><br>
              ${this.itemsRetiro.map(i => 
                `<div class="item-row"><span>• ${i.nombre}</span> <span>x${i.cantidad}</span></div>`
              ).join('')}
            </div>
            
            <div style="margin-top: 15px; font-size: 10px;">
              ${new Date().toLocaleString()} <br>
              ${this.creado.comuna}
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    ventana.document.close();
  }

  volver() {
    this.router.navigate(['/pyme/orders']);
  }
}