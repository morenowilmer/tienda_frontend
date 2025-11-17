import { TipoNotificacion } from './../model/tipo-notificacion';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notificacion {
  mensaje: string;
  tipo: TipoNotificacion;
  id?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private subject = new BehaviorSubject<Notificacion | null>(null);

  get notifications$(): Observable<Notificacion | null> {
    return this.subject.asObservable();
  }

  showExito(mensaje: string) {
    const not: Notificacion = { mensaje, tipo: TipoNotificacion.exito, id: Date.now().toString() };
    this.subject.next(not);
  }

  showInfo(mensaje: string) {
    const not: Notificacion = { mensaje, tipo: TipoNotificacion.info, id: Date.now().toString() };
    this.subject.next(not);
  }

  showError(mensaje: string) {
    const not: Notificacion = { mensaje, tipo: TipoNotificacion.error, id: Date.now().toString() };
    this.subject.next(not);
  }

  showAlerta(mensaje: string) {
    const not: Notificacion = { mensaje, tipo: TipoNotificacion.alerta, id: Date.now().toString() };
    this.subject.next(not);
  }

  clear() {
    this.subject.next(null);
  }
}
