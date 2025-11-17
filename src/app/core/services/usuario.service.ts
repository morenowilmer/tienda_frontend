import { Injectable } from '@angular/core';
import { Estado, Usuario } from '../model/usuario.model';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interface/general-response.model';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = environment.urlApi;

  constructor(private http: HttpClient) { }

  crearUSuario(usuario: Usuario): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/usuario/registrar-usuario`, usuario);
  }

  guardarUSuario(usuario: Usuario): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/usuario/guardar-usuario`, usuario);
  }

  consultarUsuario(usuario: string): Observable<ApiResponse<Usuario>> {
    return this.http.get<ApiResponse<Usuario>>(`${this.apiUrl}/usuario/consultar/${usuario}`);
  }

  consultarEstados(): Observable<ApiResponse<Estado[]>> {
    return this.http.get<ApiResponse<Estado[]>>(`${this.apiUrl}/usuario/consultar-estados`);
  }
}
