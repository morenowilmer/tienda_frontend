import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CategoriaService } from '../../core/services/categoria.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  standalone: true,
  selector: 'app-categoria-registrar',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categoria-registrar.component.html',
  styleUrls: ['./categoria-registrar.component.css'],
})
export class CategoriaRegistrarComponent {
  @Output() saved = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  categoriaForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private notificacionService: NotificationService
  ) {
    this.categoriaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(70)]],
      descripcion: ['', [Validators.maxLength(250)]],
    });
  }

  get f() {
    return this.categoriaForm.controls;
  }

  onGuardar(): void {
    if (this.categoriaForm.invalid) {
      this.categoriaForm.markAllAsTouched();
      return;
    }
    
    this.categoriaService.guardarCategoria(this.categoriaForm.value).subscribe({
      next: (response) => {
        if (response && response.respuesta) {
          this.notificacionService.showExito('Categoría registrada exitosamente');
          this.saved.emit({ ...this.categoriaForm.value });
          this.categoriaForm.reset();
        } else {
          this.notificacionService.showError('Error al registrar la categoría');
        }
      },
      error: () => {
        this.notificacionService.showError('Error al registrar la categoría');
      }
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
