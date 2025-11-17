import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoriaService } from '../../core/services/categoria.service';
import { NotificationService } from '../../core/services/notification.service';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { Subscription, of } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-categoria-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categoria-edit.component.html',
  styleUrls: ['./categoria-edit.component.css']
})
export class CategoriaEditComponent {
  @Output() saved = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  formularioConsulta: FormGroup;
  formulariocategoria: FormGroup;
  categoriasEncontradas: any[] = [];
  private searchSub: Subscription | null = null;
  @Input() categoria: any | null = null;

  constructor(private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private notificacionService: NotificationService
  ) {
    this.formularioConsulta = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(70)]]
    });
    this.formulariocategoria = this.fb.group({
      id: [''],
      nombre: ['', [Validators.required, Validators.maxLength(70)]],
      descripcion: ['', [Validators.maxLength(250)]]
    });
  }

  ngOnInit(): void {
    const control = this.formularioConsulta.get('nombre');
    if (control) {
      this.searchSub = control.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        filter((v: string) => (v || '').trim().length >= 3),
        switchMap((term: string) => {
          const q = (term || '').trim();
          if (!q) return of({ respuesta: [] });
          return this.categoriaService.consultarCategorias(encodeURIComponent(q));
        })
      ).subscribe({
        next: (res: any) => {
          this.categoriasEncontradas = (res && res.respuesta) ? res.respuesta : [];
        },
        error: () => {
          this.notificacionService.showError('Error al buscar categorías');
          this.categoriasEncontradas = [];
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.searchSub) this.searchSub.unsubscribe();
  }

  get f() { return this.formulariocategoria.controls; }

  onGuardar(): void {
    if (this.formulariocategoria.invalid) {
      this.formulariocategoria.markAllAsTouched();
      return;
    }
    this.categoriaService.guardarCategoria(this.formulariocategoria.value).subscribe({
      next: (response) => {
        if (response && response.respuesta) {
          this.notificacionService.showExito('Categoría actualizada exitosamente');
          this.saved.emit({ ...this.formulariocategoria.value });
          this.formulariocategoria.reset();
        } else {
          this.notificacionService.showError('Error al actualizar la categoría');
        }
      },
      error: () => {
        this.notificacionService.showError('Error al actualizar la categoría');
      }
    });
  }

  onConsultar(): void {
    if (this.formularioConsulta.invalid) {
      this.formularioConsulta.markAllAsTouched();
      return;
    }
    this.categoriaService.consultarCategoria(this.formularioConsulta.value.nombre).subscribe({
      next: (response) => {
        if (response && response.respuesta) {
          this.formulariocategoria.patchValue(response.respuesta);
        }
      },
      error: () => {
        this.notificacionService.showError('Error al consultar la categoría');
      }
    });
  }

  onCancel(): void { this.cancel.emit(); }

  onSeleccionarCategoria(id: any): void {
    if (!id) return;
    const found = this.categoriasEncontradas.find(c => String(c.id) === String(id));
    if (found) {
      this.formulariocategoria.patchValue(found);
      this.categoriasEncontradas = [];
      this.formularioConsulta.get('nombre')?.setValue(found.nombre);
    }
  }
}