import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ProductoService } from '../core/services/producto.service';
import { NotificationService } from '../core/services/notification.service';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  switchMap,
} from 'rxjs/operators';
import { of, Subscription, throwError } from 'rxjs';
import { PersonaService } from '../core/services/persona.service';
import { Persona, TipoDocumento } from '../core/model/persona.model';
import { Producto } from '../core/model/producto.model';
import { FacturaService } from '../core/services/factura.service';
import { Factura } from '../core/model/factura.model';

@Component({
  standalone: true,
  selector: 'app-venta',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './venta.component.html',
  styleUrls: ['./venta.component.css'],
})
export class VentaComponent implements OnInit, OnDestroy {
  formularioBusquedaPersona: FormGroup;
  formularioBuscar: FormGroup;
  formularioProducto: FormGroup;
  tiposDocumento: TipoDocumento[] = [];
  productosEncontrados: Producto[] = [];
  carrito: Array<any> = [];
  searchSub: Subscription | null = null;
  personaCompradora: Persona | null = null;

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private personaService: PersonaService,
    private facturaService: FacturaService,
    private notificacionService: NotificationService
  ) {
    this.formularioBusquedaPersona = this.fb.group({
      tipoDocumento: ['', Validators.required],
      identificacion: ['', [Validators.required, Validators.maxLength(20)]],
    });
    this.formularioBuscar = this.fb.group({
      nombre: [''],
    });
    this.formularioProducto = this.fb.group({
      productoId: [''],
      nombre: [''],
      valor: [0, [Validators.min(0)]],
      cantidad: [1, [Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    this.consultarTiposDocumento();
    const ctrl = this.formularioBuscar.get('nombre');
    if (ctrl) {
      this.searchSub = ctrl.valueChanges
        .pipe(
          debounceTime(250),
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
          next: (res: any) =>
            (this.productosEncontrados =
              res && res.respuesta ? res.respuesta : []),
          error: () => {
            this.notificacionService.showError('Error buscando productos');
            this.productosEncontrados = [];
          },
        });
    }
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
        this.notificacionService.showError(
          'Error al cargar los tipos de documento'
        );
      },
    });
  }

  seleccionarProducto(p: any): void {
    this.formularioProducto.patchValue({
      productoId: p.id,
      nombre: p.nombre,
      valor: p.precioVenta,
      cantidad: 1,
    });
    this.productosEncontrados = [];
    this.formularioBuscar.get('nombre')?.setValue(p.nombre);
  }

  agregar(): void {
    if (!this.formularioProducto.get('productoId')?.value) {
      this.notificacionService.showError('Seleccione primero un producto');
      return;
    }

    this.productoService
      .consultarProductoId(this.formularioProducto.get('productoId')?.value)
      .subscribe({
        next: (response) => {
          if (response.respuesta) {
            const producto = response.respuesta;
            if (
              producto.cantidad < this.formularioProducto.get('cantidad')?.value
            ) {
              this.notificacionService.showError(
                'Cantidad solicitada excede el inventario disponible'
              );
              return;
            } else {
              const item = {
                productoId: this.formularioProducto.get('productoId')?.value,
                nombre: this.formularioProducto.get('nombre')?.value,
                valor: Number(this.formularioProducto.get('valor')?.value || 0),
                cantidad: Number(
                  this.formularioProducto.get('cantidad')?.value || 0
                ),
                sinImpuestos: 0,
                impuestos: 0,
                total: 0,
              };
              item.sinImpuestos = item.valor * item.cantidad;
              item.impuestos = Math.round(item.sinImpuestos * 0.05);
              item.total = item.sinImpuestos + item.impuestos;
              this.carrito.push(item);
              this.formularioProducto.patchValue({
                productoId: '',
                nombre: '',
                valor: 0,
                cantidad: 1,
              });
              this.formularioBuscar.get('nombre')?.setValue('');
            }
          }
        },
        error: () => {
          this.notificacionService.showError('Error al validar producto');
          return;
        },
      });
  }

  getTotal(): number {
    return this.carrito.reduce((s, it) => s + (it.total || 0), 0);
  }

  onBuscarPersona(): void {
    const tipoDoc = this.formularioBusquedaPersona.get('tipoDocumento')?.value;
    const identificacion =
      this.formularioBusquedaPersona.get('identificacion')?.value;
    this.personaService.consultarPersona(tipoDoc, identificacion).subscribe({
      next: (response) => {
        if (response.respuesta) {
          this.personaCompradora = response.respuesta;
        }
      },
      error: (err) => {
        const mensajeError =
          err.error?.mensaje ?? 'Error al consultar la persona';
        console.error(mensajeError, err);
        this.notificacionService.showError(mensajeError);
      },
    });
  }

  get f() {
    return this.formularioBusquedaPersona.controls;
  }

  guardarCompra(): void {
    const factura: Factura = {
      idPersona: this.personaCompradora?.id || null,
      totalVenta: this.carrito.reduce((s, it) => s + (it.sinImpuestos || 0), 0),
      totalImpuesto: this.carrito.reduce(
        (s, it) => s + (it.impuestos || 0),
        0
      ),
      totalFactura: this.getTotal(),
      detallesFactura: this.carrito.map((item) => ({
        idProducto: item.productoId,
        totalItems: item.cantidad,
        precioProducto: item.valor,
        impuesto: item.impuestos,
        valorTotal: item.total,
      })),
    };
    this.facturaService.guardarFactura(factura).subscribe({
      next: (response) => {
        console.log('Compra guardada:', response);
        this.notificacionService.showExito('Compra realizada exitosamente');
        this.carrito = [];
      },
      error: (err) => {
        console.error('Error al guardar la compra', err);
        this.notificacionService.showError('Error al guardar la compra');
      },
    });
  }

  onLimpiar(): void {
    this.formularioBusquedaPersona.reset();
    this.formularioBusquedaPersona.get('tipoDocumento')?.setValue('');
    this.personaCompradora = null;
  }

  ngOnDestroy(): void {
    if (this.searchSub) this.searchSub.unsubscribe();
  }
}
