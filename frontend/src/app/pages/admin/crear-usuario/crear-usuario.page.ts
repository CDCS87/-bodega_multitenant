import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, 
  IonButton, IonSelect, IonSelectOption, IonButtons, IonBackButton, 
  IonFooter, IonListHeader, NavController, ToastController, LoadingController 
} from '@ionic/angular/standalone';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-crear-usuario',
  templateUrl: './crear-usuario.page.html',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, IonHeader, IonToolbar, IonTitle,
    IonContent, IonItem, IonLabel, IonInput, IonSelect,
    IonSelectOption, IonButtons, IonBackButton, IonFooter, IonListHeader,
    IonButton
  ]
})
export class CrearUsuarioPage implements OnInit {
  usuarioForm: FormGroup;
  esEdicion = false;
  usuarioId: number | null = null;
  zonas: any[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private navCtrl: NavController,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private cdRef: ChangeDetectorRef
  ) {
    this.usuarioForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      nombre_completo: ['', Validators.required],
      rol: ['', Validators.required],
      pymeData: this.fb.group({
        nombrePyme: [''], rut: [''], direccionPyme: [''], comuna: [''],
        contactoNombre: [''], contactoEmail: [''], contactoTelefono: [''], volumenContratado: [0]
      }),
      transportistaData: this.fb.group({
        rut: [''], patenteVehiculo: [''], capacidadCarga: [0], 
        zonaAsignadaId: [null], turno: ['MATUTINO']
      })
    });

    const navigation = this.router.getCurrentNavigation();
    const stateUser = navigation?.extras?.state ? navigation.extras.state['user'] : null;
    
    if (stateUser) {
      this.esEdicion = true;
      this.usuarioId = stateUser.id;
      this.usuarioForm.patchValue({
        email: stateUser.email,
        nombre_completo: stateUser.nombre_completo,
        rol: stateUser.rol
      });
      this.usuarioForm.get('password')?.clearValidators();
      this.usuarioForm.get('password')?.updateValueAndValidity();
    }
  }

  ngOnInit() {}

  ionViewDidEnter() {
    this.cargarZonas();
  }

  cargarZonas() {
  this.userService.getZonas().subscribe({
    next: (res: any) => {
      console.log('Respuesta cruda del servidor:', res);

      // Verificamos si res existe antes de buscar .data
      // Si res es un array, lo usamos directamente. Si tiene .data, usamos eso.
      const datosZonas = Array.isArray(res) ? res : (res && res.data ? res.data : []);

      setTimeout(() => {
        this.zonas = datosZonas;
        this.cdRef.detectChanges();
        console.log('Zonas procesadas y asignadas:', this.zonas);
      }, 0);
    },
    error: (err) => {
      console.error('Error al cargar zonas:', err);
    }
  });
}
  onRolChange() {
    const rol = this.usuarioForm.get('rol')?.value;
    const pymeGrp = this.usuarioForm.get('pymeData') as FormGroup;
    const transGrp = this.usuarioForm.get('transportistaData') as FormGroup;

    this.limpiarGrp(pymeGrp);
    this.limpiarGrp(transGrp);

    if (rol === 'PYME') {
      pymeGrp.get('nombrePyme')?.setValidators([Validators.required]);
      pymeGrp.get('rut')?.setValidators([Validators.required]);
      pymeGrp.get('contactoNombre')?.setValidators([Validators.required]);
      pymeGrp.get('contactoEmail')?.setValidators([Validators.required, Validators.email]);
      pymeGrp.get('contactoTelefono')?.setValidators([Validators.required]);
    } else if (rol === 'TRANSPORTISTA') {
      transGrp.get('rut')?.setValidators([Validators.required]);
      transGrp.get('patenteVehiculo')?.setValidators([Validators.required]);
      transGrp.get('zonaAsignadaId')?.setValidators([Validators.required]);
    }
    
    pymeGrp.updateValueAndValidity();
    transGrp.updateValueAndValidity();

    // 💡 IMPORTANTE: También necesitamos retrasar la detección aquí por los validadores dinámicos
    setTimeout(() => {
      this.cdRef.detectChanges();
    }, 0);
  }

  limpiarGrp(group: FormGroup) {
    Object.values(group.controls).forEach(c => { 
      c.clearValidators(); 
      c.updateValueAndValidity(); 
    });
  }

  async guardar() {
    if (this.usuarioForm.invalid) {
      this.mostrarToast('Por favor, completa todos los campos requeridos', 'warning');
      return;
    }

    const loader = await this.loadingCtrl.create({ message: 'Procesando...' });
    await loader.present();

    const val = this.usuarioForm.value;
    const payload = {
      ...val,
      pymeData: val.rol === 'PYME' ? val.pymeData : null,
      transportistaData: val.rol === 'TRANSPORTISTA' ? val.transportistaData : null
    };

    const peticion = this.esEdicion 
      ? this.userService.actualizarUsuario(this.usuarioId!, payload)
      : this.userService.crearUsuarioCompleto(payload);

    peticion.subscribe({
      next: () => { 
        loader.dismiss(); 
        this.mostrarToast('Usuario guardado con éxito', 'success');
        this.navCtrl.navigateBack('/admin/usuarios'); 
      },
      error: (err) => { 
        loader.dismiss(); 
        this.mostrarToast(err.error?.message || 'Error al guardar el usuario', 'danger'); 
      }
    });
  }

  async mostrarToast(m: string, c: string) {
    const t = await this.toastCtrl.create({ 
      message: m, 
      duration: 2500, 
      color: c,
      position: 'bottom'
    });
    t.present();
  }
}