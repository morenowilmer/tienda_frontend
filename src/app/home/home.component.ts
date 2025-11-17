import { LoginService } from './../login/data/services/login.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../core/services/notification.service';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  nombreUsuario: string | null = null;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.nombreUsuario = sessionStorage.getItem('nombreUsuario');
  }

  logout(): void {
    this.loginService.logout().subscribe({
      next: (res: any) => {
        if (res?.respuesta) {
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('nombreUsuario');
          this.router.navigate(['/login']);
        } else {
          const msg = res?.mensaje ?? 'Error al intentar cerrar sesión';
          this.notificationService.showError(msg);
        }
      },
      error: (err: any) => {
        if (err && err.status === 400) {
          this.notificationService.showError(
            'Solicitud incorrecta al cerrar sesión'
          );
        }
        if (err && err.status === 401) {
          this.notificationService.showError('No autorizado. Por favor, inicie sesión nuevamente.');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('nombreUsuario');
          this.router.navigate(['/login']);
        } else {
          this.notificationService.showError('Error general del sistema');
        }
      },
    });
  }
}
