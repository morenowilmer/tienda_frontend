import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PersonaService } from '../../core/services/persona.service';
import { TipoDocumento } from '../../core/model/persona.model';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  standalone: true,
  selector: 'app-persona-register',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './persona-register.component.html',
  styleUrls: ['./persona-register.component.css']
})
export class PersonaRegisterComponent implements OnInit {
  @Output() saved = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  formularioPersona: FormGroup;
  tiposDocumento: TipoDocumento[] = [];

  constructor(private fb: FormBuilder,
    private personaService: PersonaService,
    private notificacionService: NotificationService
  ) {
    this.formularioPersona = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(30)]],
      apellido: ['', [Validators.required, Validators.maxLength(30)]],
      tipoDocumento: ['', [Validators.required]],
      identificacion: ['', [Validators.required, Validators.maxLength(30), Validators.pattern('^[0-9A-Za-z-]+$')]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(60)]],
      celular: ['', [Validators.required, Validators.pattern('^3[0-9]{9}$')]],
      fechaNacimiento: ['', [Validators.required, Validators.pattern('^\\d{2}/\\d{2}/\\d{4}$')]],
      departamento: ['', null],
      ciudad: ['', null],
      direccion: ['', Validators.maxLength(200)],
    });
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

  get f() { return this.formularioPersona.controls; }

  registrarPersona(): void {
    if (this.formularioPersona.invalid) {
      this.formularioPersona.markAllAsTouched();
      return;
    }
    this.personaService.guardarPersona(this.formularioPersona.value).subscribe({
      next: (response) => {
        this.notificacionService.showExito('Persona registrada exitosamente');
        this.formularioPersona.reset();
      },
      error: (err) => {
        console.error('Error al registrar la persona', err);
        const msg = err.error?.mensaje ?? 'Error al registrar la persona';
        this.notificacionService.showError(msg);
      }
    });
  }

  cancelar(): void {
    this.cancel.emit();
  }
}
