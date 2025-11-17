import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PersonaService } from '../../core/services/persona.service';
import { NotificationService } from '../../core/services/notification.service';
import { TipoDocumento } from '../../core/model/persona.model';

@Component({
  standalone: true,
  selector: 'app-persona-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './persona-edit.component.html',
  styleUrls: ['./persona-edit.component.css']
})
export class PersonaEditComponent implements OnInit {
  @Input() persona: any | null = null; // recibir datos para editar
  @Output() saved = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  formularioBusqueda: FormGroup;
  formularioPersona: FormGroup;
  tiposDocumento: TipoDocumento[] = [];

  constructor(private fb: FormBuilder,
    private personaService: PersonaService,
    private notificacionService: NotificationService
  ) {
    this.formularioBusqueda = this.fb.group({
      tipoDocumento: ['', [Validators.required]],
      identificacion: ['', [Validators.required,Validators.maxLength(30)]]
    });
    this.formularioPersona = this.fb.group({
      id: [''],
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

  onBuscarPersona(): void {
    const tipoDoc = this.formularioBusqueda.get('tipoDocumento')?.value;
    const identificacion = this.formularioBusqueda.get('identificacion')?.value;
    this.personaService.consultarPersona(tipoDoc, identificacion).subscribe({
      next: (response) => {
        if (response.respuesta) {
          this.formularioPersona.patchValue(response.respuesta);
        }
      },
      error: (err) => {
        const mensajeError = err.error?.mensaje ?? 'Error al consultar la persona';
        console.error(mensajeError, err);
        this.notificacionService.showError(mensajeError);
      }
    });
  }

  get f() { return this.formularioPersona.controls; }

  onActualizarPersona(): void {
    if (this.formularioPersona.invalid) {
      this.formularioPersona.markAllAsTouched();
      return;
    }
    this.personaService.guardarPersona(this.formularioPersona.value).subscribe({
      next: (response) => {
        this.notificacionService.showExito('Persona guardada exitosamente');
        this.formularioPersona.reset();
      },
      error: (err) => {
        console.error('Error al guardar la persona', err);
        const msg = err.error?.mensaje ?? 'Error al guardar la persona';
        this.notificacionService.showError(msg);
      }
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onLimpiar(): void {
    this.formularioBusqueda.reset();
    this.formularioBusqueda.get('tipoDocumento')?.setValue('');
  }
}
