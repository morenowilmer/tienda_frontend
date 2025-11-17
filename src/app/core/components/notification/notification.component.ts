import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, timer } from 'rxjs';
import { NotificationService, Notificacion } from '../../services/notification.service';
import { TipoNotificacion } from '../../model/tipo-notificacion';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnDestroy {
  current: Notificacion | null = null;
  sub: Subscription;
  timerSub?: Subscription;

  TipoNotificacion = TipoNotificacion;

  constructor(private ns: NotificationService) {
    this.sub = this.ns.notifications$.subscribe(n => {
      this.current = n;
      if (this.current) {
        this.timerSub?.unsubscribe();
        this.timerSub = timer(4000).subscribe(() => this.ns.clear());
      }
    });
  }

  close() {
    this.ns.clear();
  }

  tipoToClass(tipo?: TipoNotificacion): string {
    if (!tipo) return '';
    switch (tipo) {
      case TipoNotificacion.exito:
        return 'exito';
      case TipoNotificacion.alerta:
        return 'alerta';
      case TipoNotificacion.error:
        return 'error';
      case TipoNotificacion.info:
        return 'info';
      default:
        return '';
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.timerSub?.unsubscribe();
  }
}
