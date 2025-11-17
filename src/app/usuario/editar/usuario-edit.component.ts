import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';
import { NotificationService } from '../../core/services/notification.service';
import { PersonaService } from '../../core/services/persona.service';
import { Estado } from '../../core/model/usuario.model';
import { Persona } from '../../core/model/persona.model';

@Component({
  standalone: true,
  selector: 'app-usuario-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario-edit.component.html',
  styleUrls: ['./usuario-edit.component.css']
})
export class UsuarioEditComponent implements OnInit {
  @Input() usuario: any | null = null;
  @Output() saved = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  formularioBusqueda: FormGroup;
  formularioUsuario: FormGroup;

  estados: Estado[] = [];
  personaUsuario: Persona | null = null;
  contrasenasNoCoinciden: boolean = false;

  constructor(private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private personaService: PersonaService,
    private notificacionService: NotificationService
  ) {
    this.formularioBusqueda = this.fb.group({
      usuario: ['', [Validators.required, Validators.maxLength(40)]]
    });
    this.formularioUsuario = this.fb.group({
      usuario: [{value: '', disabled: true}],
      contrasena: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
      contrasenaRepetir: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
      idPersona: [''],
      estado: ['', [Validators.required]]
    });
  }

  get f() { return this.formularioUsuario.controls; }

  ngOnInit(): void {
    this.consultarEstados();
  }

  consultarEstados(): void {
    this.usuarioService.consultarEstados().subscribe({
      next: (response) => {
        if (response.respuesta) {
          this.estados = response.respuesta;
        }
      },
      error: (err) => {
        console.error('Error al cargar los tipos de documento', err);
        this.notificacionService.showError('Error al cargar los tipos de documento');
      }
    });
  }

  onBuscarUsuario(): void {
    const usuario = this.formularioBusqueda.get('usuario')?.value;
    if (!usuario) {
      this.notificacionService.showAlerta('Por favor, ingrese un nombre de usuario para buscar.');
      return;
    }

    this.usuarioService.consultarUsuario(usuario).subscribe({
      next: (response) => {
        if (response.respuesta) {
          this.formularioUsuario.patchValue({
            usuario: response.respuesta.usuario,
            idPersona: response.respuesta.idPersona, 
            estado: response.respuesta.estado
          });
          this.buscarPersona(response.respuesta.idPersona);
        } else {
          this.notificacionService.showAlerta('Usuario no encontrado.');
        }
      },
      error: (err) => {
        const mensajeError = err.error?.mensaje ?? 'Error al consultar el usuario';
        console.error(mensajeError, err);
        this.notificacionService.showError(mensajeError);
      }
    });
  }

  buscarPersona(idPersona: number): void {
    this.personaService.consultarPersonaPorId(idPersona).subscribe({
      next: (response) => {
        if (response.respuesta) {
          this.personaUsuario = response.respuesta;
        }
      }
    });
  }

  onGuardar(): void {
    this.contrasenasNoCoinciden = this.formularioUsuario.get('contrasena')?.value !== this.formularioUsuario.get('contrasenaRepetir')?.value;
    if (this.contrasenasNoCoinciden) {
      return;
    }

    if (this.formularioUsuario.invalid) {
      this.formularioUsuario.markAllAsTouched();
      return;
    }

    this.usuarioService.guardarUSuario(this.formularioUsuario.value).subscribe({
      next: (response) => {
        this.notificacionService.showExito('Usuario guardado exitosamente');
        this.saved.emit({ ...this.formularioUsuario.value });
      },
      error: (err) => {
        console.error('Error al guardar el usuario', err);
        const msg = err.error?.mensaje ?? 'Error al guardar el usuario';
        this.notificacionService.showError(msg);
      }
    });
  }

  onCancel(): void { this.cancel.emit(); }
}
