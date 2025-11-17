import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CategoriaService } from '../../core/services/categoria.service';
import { ProductoService } from '../../core/services/producto.service';
import { NotificationService } from '../../core/services/notification.service';
import { Categoria } from '../../core/model/categoria.model';
import { Producto } from '../../core/model/producto.model';
import { debounceTime, distinctUntilChanged, filter, of, Subscription, switchMap } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-producto-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './producto-edit.component.html',
  styleUrls: ['./producto-edit.component.css'],
})
export class ProductoEditComponent implements OnInit {
  @Input() producto: any | null = null;
  @Output() saved = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  formularioConsulta: FormGroup;
  formularioProducto: FormGroup;
  agregarInvForm: FormGroup;
  categorias: Categoria[] = [];
  productosEncontrados: Producto[] = [];

  private searchSub: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private productoService: ProductoService,
    private notificacionService: NotificationService
  ) {
    this.formularioConsulta = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(70)]],
    });
    this.formularioProducto = this.fb.group({
      id: [''],
      nombre: ['', [Validators.required, Validators.maxLength(120)]],
      descripcion: ['', [Validators.maxLength(500)]],
      cantidad: [0, [Validators.required, Validators.min(0)]],
      codigoBarras: ['', [Validators.maxLength(80)]],
      precioCompra: [0, [Validators.required, Validators.min(0)]],
      precioVenta: [0, [Validators.required, Validators.min(0)]],
      idCategoria: ['', Validators.required],
    });

    this.agregarInvForm = this.fb.group({
      cantidadAgregar: [0, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    const control = this.formularioConsulta.get('nombre');
    if (control) {
      this.searchSub = control.valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          filter((v: string) => (v || '').trim().length >= 3),
          switchMap((term: string) => {
            const q = (term || '').trim();
            if (!q) return of({ respuesta: [] });
            return this.productoService.consultarProductoNombre(
              encodeURIComponent(q)
            );
          })
        )
        .subscribe({
          next: (res: any) => {
            this.productosEncontrados =
              res && res.respuesta ? res.respuesta : [];
          },
          error: () => {
            this.notificacionService.showError('Error al buscar productos');
            this.productosEncontrados = [];
          },
        });
    }

    this.cargarCategorias();
    if (this.producto) this.formularioProducto.patchValue(this.producto);
  }

  ngOnDestroy(): void {
    if (this.searchSub) this.searchSub.unsubscribe();
  }

  cargarCategorias(): void {
    this.categoriaService.consultarCategoriaTodas().subscribe({
      next: (res: any) =>
        (this.categorias = res && res.respuesta ? res.respuesta : []),
      error: () => (this.categorias = []),
    });
  }

  get f() {
    return this.formularioProducto.controls;
  }

  onGuardar(): void {
    if (this.formularioProducto.invalid) {
      this.formularioProducto.markAllAsTouched();
      return;
    }
    const datos = { ...this.formularioProducto.value };
    this.productoService.guardarProducto(datos).subscribe({
      next: (resp: any) => {
        if (resp && resp.respuesta) {
          this.notificacionService.showExito('Producto actualizado correctamente');
          this.saved.emit(resp.respuesta);
        } else {
          this.notificacionService.showError(resp?.mensaje ?? 'Error al actualizar producto');
        }
      },
      error: () =>
        this.notificacionService.showError('Error al actualizar producto'),
    });
  }

  onSeleccionarCategoria(id: any): void {
    if (!id) return;
    const found = this.productosEncontrados.find(c => String(c.id) === String(id));
    if (found) {
      this.formularioProducto.patchValue(found);
      this.productosEncontrados = [];
      this.formularioConsulta.get('nombre')?.setValue(found.nombre);
    }
  }

  onAgregarInventario(): void {
    if (this.agregarInvForm.invalid) {
      this.agregarInvForm.markAllAsTouched();
      return;
    }
    const toAdd = Number(this.agregarInvForm.value.cantidadAgregar || 0);
    const current = Number(this.formularioProducto.get('cantidad')?.value || 0);
    const nuevo = current + toAdd;
    this.formularioProducto.get('cantidad')?.setValue(nuevo);
    this.notificacionService.showExito(`Inventario agregado: +${toAdd}. Nuevo stock: ${nuevo}`);
    this.agregarInvForm.reset({ cantidadAgregar: 0 });
  }

  onConsultar(): void {}

  onCancel(): void {
    this.cancel.emit();
  }
}

