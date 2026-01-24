import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, IonInput, AlertController } from '@ionic/angular';
import { RetiroService } from 'src/app/services/retiro.service';
import { addIcons } from 'ionicons';
import { qrCodeOutline, search, remove, add, checkmarkDoneCircle, arrowBack } from 'ionicons/icons';

@Component({
  selector: 'app-recepcion',
  templateUrl: './recepcion.page.html',
  styleUrls: ['./recepcion.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RecepcionPage implements OnInit {

  @ViewChild('inputScanner') inputScanner!: IonInput;

  codigoBusqueda: string = '';
  pedidoActual: any = null;      // Datos de cabecera (Pyme, ID, etc)
  itemsChecklist: any[] = [];    // Lista editable para el conteo
  observaciones: string = '';
  loading: boolean = false;

  constructor(
    private retiroService: RetiroService,
    private alertController: AlertController
  ) {
    addIcons({ qrCodeOutline, search, remove, add, checkmarkDoneCircle, arrowBack });
  }

  ngOnInit() {}

  // FASE 1: Buscar el pedido al escanear
  buscarPedido() {
    if (!this.codigoBusqueda.trim()) return;

    this.loading = true;
    this.retiroService.buscarPorCodigo(this.codigoBusqueda.trim()).subscribe({
      next: (res: any) => {
        // Asumiendo que res trae { retiro: {...}, detalles: [...] }
        // Ajusta según responda tu backend real
        const datos = res.retiro || res; 
        
        this.pedidoActual = datos;
        
        // PREPARAMOS EL CHECKLIST:
        // Clonamos los detalles para no modificar el original hasta confirmar
        // Asumimos "inocencia": cantidad_recibida = cantidad_esperada por defecto
        this.itemsChecklist = (datos.detalles || []).map((d: any) => ({
          producto_id: d.producto_id,
          nombre: d.producto?.nombre || 'Producto sin nombre',
          sku: d.producto?.sku,
          cantidad_esperada: d.cantidad,
          cantidad_recibida: d.cantidad 
        }));

        this.loading = false;
        this.codigoBusqueda = ''; // Limpiamos buscador
      },
      error: (err) => {
        console.error(err);
        this.mostrarAlerta('Error', 'No se encontró el pedido o ya fue procesado.');
        this.loading = false;
        setTimeout(() => this.inputScanner.setFocus(), 100);
      }
    });
  }

  // Botones +/- del checklist
  ajustarCantidad(item: any, valor: number) {
    const nueva = item.cantidad_recibida + valor;
    if (nueva >= 0) {
      item.cantidad_recibida = nueva;
    }
  }

  // FASE 2: Enviar datos definitivos
  async confirmarRecepcion() {
    // Validamos si hay algo raro
    const hayDiferencias = this.itemsChecklist.some(i => i.cantidad_recibida !== i.cantidad_esperada);
    
    if (hayDiferencias && !this.observaciones.trim()) {
      this.mostrarAlerta('Atención', 'Hay diferencias en el conteo. Debes escribir una observación obligatoriamente.');
      return;
    }

    this.loading = true;

    // Armamos el paquete para el backend
    const payload = {
      retiro_id: this.pedidoActual.id,
      observaciones: this.observaciones,
      detalles: this.itemsChecklist.map(i => ({
        producto_id: i.producto_id,
        cantidad_recibida: i.cantidad_recibida,
        diferencia: i.cantidad_recibida - i.cantidad_esperada
      }))
    };

    this.retiroService.confirmarRecepcion(payload).subscribe({
      next: async (res) => {
        await this.mostrarAlerta('✅ Recepción Exitosa', 'El inventario ha sido actualizado en bodega.');
        this.limpiarPantalla();
      },
      error: (err) => {
        console.error(err);
        this.mostrarAlerta('Error', 'Falló la recepción. Intenta nuevamente.');
        this.loading = false;
      }
    });
  }

  limpiarPantalla() {
    this.pedidoActual = null;
    this.itemsChecklist = [];
    this.observaciones = '';
    this.loading = false;
    setTimeout(() => this.inputScanner?.setFocus(), 500);
  }

  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }
}
