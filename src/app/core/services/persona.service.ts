import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../interface/general-response.model';
import { Observable } from 'rxjs';
import { Persona, TipoDocumento } from '../model/persona.model';

@Injectable({
  providedIn: 'root'
})
export class PersonaService {
  
private apiUrl = environment.urlApi;

  constructor(private http: HttpClient) { }
  
  guardarPersona(persona: Persona): Observable<ApiResponse<Persona>> {
    return this.http.post<ApiResponse<Persona>>(`${this.apiUrl}/persona/guardar`, persona);
  }

  consultarPersona(tipoDoc: number, identificacion: string): Observable<ApiResponse<Persona>> {
    const url = `${this.apiUrl}/persona/consultar/${tipoDoc}/${encodeURIComponent(identificacion)}`;
    return this.http.get<ApiResponse<Persona>>(url);
  }

  tiposDocumentos(): Observable<ApiResponse<TipoDocumento[]>> {
    return this.http.get<ApiResponse<TipoDocumento[]>>(`${this.apiUrl}/persona/tipos-documentos`);
  }
}
