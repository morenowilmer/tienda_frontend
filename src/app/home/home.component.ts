import { LoginService } from './../login/data/services/login.service';
import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonaRegisterComponent } from '../persona/registar/persona-register.component';
import { PersonaEditComponent } from '../persona/editar/persona-edit.component';
import { UsuarioRegisterComponent } from '../usuario/registar/usuario-register.component';
import { UsuarioEditComponent } from '../usuario/editar/usuario-edit.component';
import { Router } from '@angular/router';
import { NotificationService } from '../core/services/notification.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, PersonaRegisterComponent, PersonaEditComponent, UsuarioRegisterComponent, UsuarioEditComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  nombreUsuario: string | null = null;
  openMenu: string | null = null;
  showPersonaRegister = false;
  showPersonaEdit = false;
  showUsuarioRegister = false;
  showUsuarioEdit = false;
  usuarioToEdit: any = null;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private notificationService: NotificationService
    , private hostRef: ElementRef
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!this.hostRef.nativeElement.contains(target)) {
      this.openMenu = null;
    }
  }

  ngOnInit(): void {
    this.nombreUsuario = sessionStorage.getItem('nombreUsuario');
  }

  openPersonaRegistrar(): void {
    this.showPersonaRegister = true;
    this.showPersonaEdit = false;
  }

  openPersonaEditar(): void {
    this.showPersonaEdit = true;
    this.showPersonaRegister = false;
  }

  openUsuarioRegistrar(): void {
    this.showUsuarioRegister = true;
    this.showUsuarioEdit = false;
  }

  openUsuarioEditar(usuario?: any): void {
    this.usuarioToEdit = usuario ?? null;
    this.showUsuarioEdit = true;
    this.showUsuarioRegister = false;
  }

  toggleMenu(menu: string, event: MouseEvent): void {
    event.stopPropagation();
    if (this.openMenu === menu) {
      this.openMenu = null;
    } else {
      this.openMenu = menu;
    }
  }

  onPersonaSaved(payload: any): void {
    console.log('Persona guardada', payload);
    this.notificationService.showExito('Persona guardada correctamente');
    this.showPersonaRegister = false;
    this.showPersonaEdit = false;
  }

  onUsuarioSaved(payload: any): void {
    console.log('Usuario guardado', payload);
    this.notificationService.showExito('Usuario guardado correctamente');
    this.showUsuarioRegister = false;
    this.showUsuarioEdit = false;
  }

  onUsuarioCancel(): void {
    this.showUsuarioRegister = false;
    this.showUsuarioEdit = false;
  }

  onPersonaCancel(): void {
    this.showPersonaRegister = false;
    this.showPersonaEdit = false;
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
