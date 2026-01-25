import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonItem, IonLabel, IonChip, 
  IonItemSliding, IonItemOptions, IonItemOption, 
  IonIcon, IonButtons, IonButton, IonSearchbar, IonFab, IonFabButton, IonNote 
} from '@ionic/angular/standalone'; 
import { UserService } from '../../../services/user.service';
import { AlertController, ToastController, LoadingController, NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, searchOutline, trash, create, personOutline, searchCircleOutline} from 'ionicons/icons';

@Component({
  selector: 'app-usuarios',
  standalone: true, 
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonChip,
    IonIcon, IonSearchbar, IonFab, IonFabButton,
    IonButtons,
    IonButton
],
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
})
export class UsuariosPage {
  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];

  constructor(
    private userService: UserService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController
  ) {
    // Registramos todos los iconos necesarios para la vista
    addIcons({ searchOutline, add, trash, create, personOutline, searchCircleOutline });
  }

  ionViewWillEnter() {
    this.cargarUsuarios();
  }

  async cargarUsuarios() {
    const loader = await this.loadingCtrl.create({ message: 'Cargando usuarios...' });
    await loader.present();

    this.userService.getUsuarios().subscribe({
      next: (res) => {
        this.usuarios = res;
        this.usuariosFiltrados = res;
        loader.dismiss();
      },
      error: () => loader.dismiss()
    });
  }

  // Lógica del buscador optimizada
  filterUsuarios(event: any) {
    const texto = (event.target.value || '').toLowerCase();
    this.usuariosFiltrados = this.usuarios.filter(u => 
      u.nombre_completo.toLowerCase().includes(texto) || 
      u.rol.toLowerCase().includes(texto)
    );
  }

  // Helper para asignar colores a los chips según el rol de la BBDD
  getRoleColor(rol: string) {
    const r = rol?.toUpperCase();
    switch (r) {
      case 'ADMINISTRADOR': return 'danger';
      case 'PYME': return 'tertiary';
      case 'BODEGA': return 'warning';
      case 'TRANSPORTISTA': return 'success';
      default: return 'medium';
    }
  }

  editarUsuario(user: any) {
    this.navCtrl.navigateForward('/admin/crear-usuario', {
      state: { user: user }
    });
  }

  irACrear() {
    console.log('Navegando a Creacion');
    this.navCtrl.navigateForward('/admin/crear-usuario');
  }

  // ✅ FUNCIONALIDAD DE ELIMINACIÓN
  async confirmarEliminar(id: number) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar este usuario? Esta acción es permanente.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.ejecutarBorrado(id);
          }
        }
      ]
    });
    await alert.present();
  }

  private ejecutarBorrado(id: number) {
    this.userService.eliminarUsuario(id).subscribe({
      next: () => {
        // Actualizamos ambas listas para reflejar el cambio en la UI inmediatamente
        this.usuarios = this.usuarios.filter(u => u.id !== id);
        this.usuariosFiltrados = this.usuariosFiltrados.filter(u => u.id !== id);
        this.mostrarToast('Usuario eliminado con éxito');
      },
      error: (err) => {
        console.error(err);
        this.mostrarToast('Error al intentar eliminar el usuario');
      }
    });
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
}