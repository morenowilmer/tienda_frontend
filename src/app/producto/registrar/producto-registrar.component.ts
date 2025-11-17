import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoriaService } from '../../core/services/categoria.service';
import { ProductoService } from '../../core/services/producto.service';
import { NotificationService } from '../../core/services/notification.service';
import { Categoria } from '../../core/model/categoria.model';

@Component({
  standalone: true,
  selector: 'app-producto-registrar',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './producto-registrar.component.html',
  styleUrls: ['./producto-registrar.component.css']
})
export class ProductoRegistrarComponent implements OnInit {
  @Output() saved = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  formularioProducto: FormGroup;
  categorias: Categoria[] = [];

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private productoService: ProductoService,
    private notificationService: NotificationService
  ) {
    this.formularioProducto = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(70)]],
      descripcion: ['', [Validators.maxLength(250)]],
      cantidad: [0, [Validators.required, Validators.min(0)]],
      codigoBarras: ['', [Validators.maxLength(50)]],
      precioCompra: [0, [Validators.required, Validators.min(0)]],
      precioVenta: [0, [Validators.required, Validators.min(0)]],
      idCategoria: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.categoriaService.consultarCategoriaTodas().subscribe({
      next: (res: any) => 
        this.categorias = (res && res.respuesta) ? res.respuesta : [],
      error: () => this.categorias = []
    });
  }

  get f() { return this.formularioProducto.controls; }

  onRegistrar(): void {
    if (this.formularioProducto.invalid) {
      this.formularioProducto.markAllAsTouched();
      return;
    }
    const datos = { ...this.formularioProducto.value };
    this.productoService.guardarProducto(datos).subscribe({
      next: (resp: any) => {
        if (resp && resp.respuesta) {
          this.notificationService.showExito('Producto registrado correctamente');
          this.saved.emit(resp.respuesta);
          this.formularioProducto.reset({ cantidad: 0, precioCompra: 0, precioVenta: 0 });
        } else {
          this.notificationService.showError(resp?.mensaje ?? 'Error al guardar producto');
        }
      },
      error: () => this.notificationService.showError('Error al guardar producto')
    });
  }

  onCancel(): void { this.cancel.emit(); }
}
