export interface Factura {
    id: string | null;
    idPersona: number | null;
    totalVenta: number;
    totalImpuesto: number;
    totalFactura: number;
    fechaCompra: string | null;
    detallesFactura: DetalleFactura[];
}

export interface DetalleFactura {
    id: number | null;
    idProducto: number;
    totalItems: number;
    precioProducto: number;
    impuesto: number;
    valorTotal: number;
}