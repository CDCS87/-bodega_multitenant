import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonItem, IonLabel, IonInput, IonTextarea, IonButton, IonSpinner, IonBadge, IonText, IonGrid, IonRow, IonCol, IonList, IonListHeader, IonItemSliding, IonItemOptions, IonItemOption, IonIcon, IonModal, IonSearchbar, IonSelect, IonSelectOption, IonToggle // ✅ Nuevo componente para el switch
, IonCardSubtitle } from '@ionic/angular/standalone';
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
import { AuthService } from 'src/app/services/auth.service'; // ✅ Importamos Auth

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
    IonSpinner, IonBadge,
    IonGrid, IonRow, IonCol, IonList, IonListHeader,
    IonItemSliding, IonItemOptions, IonItemOption, IonIcon,
    IonModal, IonSearchbar, IonSelect, IonSelectOption,
    IonToggle,
    IonCardSubtitle
],
  templateUrl: './crear-retiro.page.html',
  styleUrls: ['./crear-retiro.page.scss']
})
export class CrearRetiroPage implements OnInit {
  loading = false;

  // Datos Pyme (Caché)
  pymeData: any = null;
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
    private authService: AuthService // 
  ) {
    addIcons({ trashOutline, addCircleOutline, searchOutline, closeOutline, qrCodeOutline, cubeOutline, printOutline, checkmarkCircle });
  }

  ngOnInit() {
    this.cargarInventario();
    this.cargarDatosPyme(); // 
  }

  // --- 1. LÓGICA DE DATOS PYME ---
  cargarDatosPyme() {
    this.authService.getMyPyme().subscribe({
      next: (pyme) => {
        this.pymeData = pyme;
        // Si hay datos y el switch está activo, llenamos el formulario
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
      // Si lo desactiva, limpiamos para que escriba (opcional, o dejar lo que estaba)
      this.form.direccion = '';
      this.form.comuna = '';
    }
  }

  private llenarDireccionConPyme() {
    if (this.pymeData) {
      this.form.direccion = this.pymeData.direccion_comercial || '';
      this.form.comuna = this.pymeData.comuna || '';
    }
  }

  // --- 2. LÓGICA DE PRODUCTOS (IGUAL QUE ANTES) ---
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
        detalles: this.itemsRetiro.map(i => ({
          producto_id: i.producto_id,
          cantidad: i.cantidad
        }))
      };

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
      this.loading = false;
    }
  }
  
  // (Mantienes imprimirQR y volver igual que antes...)
  imprimirQR() { /* ... tu código de impresión ... */ }
  volver() { this.router.navigate(['/pyme/orders']); }
}
