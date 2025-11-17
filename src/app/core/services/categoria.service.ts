import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Categoria } from '../model/categoria.model';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interface/general-response.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl = environment.urlApi;

  constructor(private http: HttpClient) { }

  guardarCategoria(categoria: Categoria): Observable<ApiResponse<Categoria>> {
    return this.http.post<ApiResponse<Categoria>>(`${this.apiUrl}/categoria/guardar`, categoria);
  }

  consultarCategoria(nombre: string): Observable<ApiResponse<Categoria>> {
    return this.http.get<ApiResponse<Categoria>>(`${this.apiUrl}/categoria/consultar/${nombre}`);
  }

  consultarCategorias(nombre: string): Observable<ApiResponse<Categoria>> {
    return this.http.get<ApiResponse<Categoria>>(`${this.apiUrl}/categoria/consultar-coincidencias/${nombre}`);
  }

  consultarCategoriaTodas(): Observable<ApiResponse<Categoria[]>> {
    return this.http.get<ApiResponse<Categoria[]>>(`${this.apiUrl}/categoria/listar`);
  }
}
