export interface Producto {
    id?: number | null;
    nombre: string;
    descripcion: string;
    cantidad: number;
    codigoBarras: string;
    precioCompra: number;
    precioVenta: number;
    idCategoria: number;
}