import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonButton, IonSpinner } from '@ionic/angular/standalone';
import { TransporteService } from '../../../services/transporte.service';

@Component({
  selector: 'app-transporte-retiros',
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonList, IonItem, IonLabel, IonButton, IonSpinner
  ],
  templateUrl: './transporte-retiros.page.html'
})
export class TransporteRetirosPage {

  retiros: any[] = [];
  loading = false;

  constructor(private transporte: TransporteService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.transporte.getRetiros().subscribe((res: any) => {
      this.retiros = res.retiros || [];
      this.loading = false;
    });
  }

  retirar(id: number) {
    this.transporte.marcarRetirado(id).subscribe(() => this.load());
  }
}
