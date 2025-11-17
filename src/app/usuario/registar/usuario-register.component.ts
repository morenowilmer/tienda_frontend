import { Persona } from './../../core/model/persona.model';
import { PersonaService } from './../../core/services/persona.service';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';
import { TipoDocumento } from '../../core/model/persona.model';
import { UsuarioService } from '../../core/services/usuario.service';

@Component({
  standalone: true,
  selector: 'app-usuario-register',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario-register.component.html',
  styleUrls: ['./usuario-register.component.css'],
})
export class UsuarioRegisterComponent implements OnInit {
  @Output() saved = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  formularioBusqueda: FormGroup;
  formularioUsuario: FormGroup;

  personaBuscada: Persona | null = null;
  tiposDocumento: TipoDocumento[] = [];
  contrasenasNoCoinciden: boolean = false;

  constructor(private fb: FormBuilder,
    private personaService: PersonaService,
    private usuarioService: UsuarioService,
    private notificacionService: NotificationService
  ) {
    this.formularioBusqueda = this.fb.group({
      tipoDocumento: ['', [Validators.required]],
      identificacion: ['', [Validators.required, Validators.maxLength(30)]]
    });
    this.formularioUsuario = this.fb.group({
      usuario: ['', [Validators.required, Validators.maxLength(40)]],
      contrasena: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
      contrasenaRepetir: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
      idPersona: [''],
    });
  }

  get f() {
    return this.formularioUsuario.controls;
  }
  get fbusq() {
    return this.formularioBusqueda.controls;
  }

  ngOnInit(): void {
    this.consultarTiposDocumento();
  }

  consultarTiposDocumento(): void {
    this.personaService.tiposDocumentos().subscribe({
      next: (response) => {
        if (response.respuesta) {
          this.tiposDocumento = response.respuesta;
        }
      },
      error: (err) => {
        console.error('Error al cargar los tipos de documento', err);
        this.notificacionService.showError('Error al cargar los tipos de documento');
      }
    });
  }

  onBuscarPersona(): void {
    if (this.formularioBusqueda.invalid) {
      this.formularioBusqueda.markAllAsTouched();
      return;
    }

    const tipoDoc = this.formularioBusqueda.get('tipoDocumento')?.value;
    const identificacion = this.formularioBusqueda.get('identificacion')?.value;
    this.personaService.consultarPersona(tipoDoc, identificacion).subscribe({
      next: (response) => {
        if (response.respuesta) {
          this.formularioUsuario.get('idPersona')?.setValue(response.respuesta.id);
          this.personaBuscada = response.respuesta;
        }
      },
      error: (err) => {
        const mensajeError = err.error?.mensaje ?? 'Error al consultar la persona';
        console.error(mensajeError, err);
        this.notificacionService.showError(mensajeError);
      }
    });
  }

  onSubmit(): void {
    this.contrasenasNoCoinciden = this.formularioUsuario.get('contrasena')?.value !== this.formularioUsuario.get('contrasenaRepetir')?.value;
    if (this.contrasenasNoCoinciden) {
      return;
    }

    if (this.formularioUsuario.invalid) {
      this.formularioUsuario.markAllAsTouched();
      return;
    }

    if (!this.formularioUsuario.get('idPersona')?.value) {
      this.notificacionService.showAlerta('Debe buscar una persona antes de registrar el usuario.');
      return;
    }

    this.usuarioService.crearUSuario(this.formularioUsuario.value).subscribe({
      next: (response) => {
        this.notificacionService.showExito('Usuario registrado exitosamente');
        this.saved.emit({ ...this.formularioUsuario.value });
      },
      error: (err) => {
        console.error('Error al registrar el usuario', err);
        const msg = err.error?.mensaje ?? 'Error al registrar el usuario';
        this.notificacionService.showError(msg);
      }
    });
  }

  onLimpiar(): void {
    this.formularioBusqueda.reset();
    this.formularioBusqueda.get('tipoDocumento')?.setValue('');
  }

  limpiarFormularioUsuario(): void {
    this.formularioUsuario.reset();
    this.formularioUsuario.get('idPersona')?.setValue('');
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
