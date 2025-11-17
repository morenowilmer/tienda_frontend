import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../../core/interface/general-response.model';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private apiUrl = environment.urlApi;

  constructor(private http: HttpClient) { }
  
  login(usuario: string, contrasena: string): Observable<ApiResponse<String>> {
    if (!usuario || !contrasena) {
      return throwError(() => new Error('Usuario o contraseña vacíos'));
    }

    return this.http.post<ApiResponse<String>>(`${this.apiUrl}/auth/login`, { usuario, contrasena });
  }

  logout(): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/auth/cerrar-sesion`, {});
  }
}
