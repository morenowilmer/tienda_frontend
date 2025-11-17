import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interface/general-response.model';
import { Producto } from '../model/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private apiUrl = environment.urlApi;
  constructor(private http: HttpClient) {}

  guardarProducto(producto: Producto): Observable<ApiResponse<Producto>> {
    return this.http.post<ApiResponse<Producto>>(
      `${this.apiUrl}/producto/guardar`,
      producto
    );
  }

  consultarProducto(id: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/producto/consultar/${id}`
    );
  }

  listarProductos(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/producto/listar`);
  }

  consultarProductoNombre(nombre: string): Observable<ApiResponse<Producto[]>> {
    return this.http.get<ApiResponse<Producto[]>>(
      `${this.apiUrl}/producto/consultar/nombre/${nombre}`
    );
  }

  consultarProductoId(id: number): Observable<ApiResponse<Producto>> {
    return this.http.get<ApiResponse<Producto>>(
      `${this.apiUrl}/producto/buscar/id/${id}`
    );
  }
}
