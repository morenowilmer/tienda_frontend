import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Factura } from '../model/factura.model';
import { ApiResponse } from '../interface/general-response.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FacturaService {
  private apiUrl = environment.urlApi;

  constructor(private http: HttpClient) {}

  guardarFactura(factura: Factura): Observable<ApiResponse<Factura>> {
      return this.http.post<ApiResponse<Factura>>(`${this.apiUrl}/factura/guardar`, factura);
    }
}
