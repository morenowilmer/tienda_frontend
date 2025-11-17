export interface Factura {  
    idPersona: number | null;
    totalVenta: number;
    totalImpuesto: number;
    totalFactura: number;
    detallesFactura: DetalleFactura[];
}

export interface DetalleFactura {
    idProducto: number;
    totalItems: number;
    precioProducto: number;
    impuesto: number;
    valorTotal: number;
}