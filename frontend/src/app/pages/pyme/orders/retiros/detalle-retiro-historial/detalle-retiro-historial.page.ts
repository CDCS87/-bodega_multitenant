import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, 
  IonButtons, IonBackButton, IonCard, IonCardContent, 
  IonList, IonItem, IonLabel, IonNote, IonIcon, IonBadge, 
  IonGrid, IonRow, IonCol, IonSpinner, IonText } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { RetiroService } from 'src/app/services/retiro.service';
import { addIcons } from 'ionicons';
import { 
  cubeOutline, documentTextOutline, locationOutline, 
  personOutline, alertCircleOutline, timeOutline 
} from 'ionicons/icons';
import { IonicModule } from "@ionic/angular";

@Component({
  selector: 'app-detalle-retiro-historial',
  templateUrl: './detalle-retiro-historial.page.html',
  styleUrls: ['./detalle-retiro-historial.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonButtons, IonBackButton, IonCard, IonCardContent,
    IonList, IonItem, IonLabel, IonIcon, IonBadge,
    IonicModule
]
})
export class DetalleRetiroHistorialPage implements OnInit {

  retiro: any = null;
  loading: boolean = true;
  errorMsg: string = '';

  constructor(
    private route: ActivatedRoute,
    private retiroService: RetiroService
  ) {
    addIcons({ cubeOutline, documentTextOutline, locationOutline, personOutline, alertCircleOutline, timeOutline });
  }

  ngOnInit() {
    // 1. Capturamos el ID de la URL
    const idParam = this.route.snapshot.paramMap.get('id');
    console.log('🔎 ID recibido en URL:', idParam);

    if (idParam) {
      this.cargarDetalle(idParam);
    } else {
      this.loading = false;
      this.errorMsg = 'No se recibió un ID de orden válido.';
    }
  }

  cargarDetalle(id: string | number) {
    this.loading = true;
    this.retiroService.getRetiroById(+id).subscribe({
      next: (res: any) => {
        console.log('📦 Datos recibidos del backend:', res);
        
        // Manejamos si viene directo o dentro de 'data' o 'retiro'
        this.retiro = res.data || res.retiro || res;
        
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar detalle:', err);
        this.loading = false;
        this.errorMsg = 'No se pudo cargar la información de la orden.';
      }
    });
  }

  getTotalUnidades(): number {
    if (!this.retiro || !this.retiro.detalles) return 0;
    // Suma todas las cantidades de los productos
    return this.retiro.detalles.reduce((acc: number, item: any) => acc + (item.cantidad || 0), 0);
  }

  // Helper para colores
  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'COMPLETADO': return 'success';
      case 'EN_BODEGA': return 'warning';
      case 'RETIRADO': return 'tertiary';
      case 'ASIGNADO': return 'secondary';
      case 'CANCELADO': return 'danger';
      default: return 'medium';
    }
  }
}
