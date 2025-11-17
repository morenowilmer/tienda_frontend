import { LoginService } from './../login/data/services/login.service';
import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonaRegisterComponent } from '../persona/registar/persona-register.component';
import { PersonaEditComponent } from '../persona/editar/persona-edit.component';
import { UsuarioRegisterComponent } from '../usuario/registar/usuario-register.component';
import { UsuarioEditComponent } from '../usuario/editar/usuario-edit.component';
import { CategoriaRegistrarComponent } from '../categoria/registrar/categoria-registrar.component';
import { CategoriaEditComponent } from '../categoria/editar/categoria-edit.component';
import { ProductoRegistrarComponent } from '../producto/registrar/producto-registrar.component';
import { ProductoEditComponent } from '../producto/editar/producto-edit.component';
import { Router } from '@angular/router';
import { NotificationService } from '../core/services/notification.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, PersonaRegisterComponent, PersonaEditComponent, UsuarioRegisterComponent, UsuarioEditComponent, 
    CategoriaRegistrarComponent, CategoriaEditComponent, ProductoRegistrarComponent, ProductoEditComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  nombreUsuario: string | null = null;
  openMenu: string | null = null;
  showPersonaRegistrar = false;
  showPersonaEditar = false;
  showUsuarioRegistrar = false;
  showUsuarioEditar = false;
  showCategoriaRegistrar = false;
  showCategoriaEditar = false;
  showProductoRegistrar = false;
  showProductoEditar = false;

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
    this.showPersonaRegistrar = true;
    this.showPersonaEditar = false;
    this.showUsuarioEditar = false;
    this.showUsuarioRegistrar = false;
    this.showCategoriaRegistrar = false;
    this.showCategoriaEditar = false;
    this.showProductoEditar = false;
    this.showProductoRegistrar = false;
  }

  openPersonaEditar(): void {
    this.showPersonaEditar = true;
    this.showPersonaRegistrar = false;
    this.showUsuarioEditar = false;
    this.showUsuarioRegistrar = false;
    this.showCategoriaRegistrar = false;
    this.showCategoriaEditar = false;
    this.showProductoEditar = false;
    this.showProductoRegistrar = false;
  }

  openUsuarioRegistrar(): void {
    this.showUsuarioRegistrar = true;
    this.showUsuarioEditar = false;
    this.showPersonaEditar = false;
    this.showPersonaRegistrar = false;
    this.showCategoriaRegistrar = false;
    this.showCategoriaEditar = false;
    this.showProductoEditar = false;
    this.showProductoRegistrar = false;
  }

  openUsuarioEditar(): void {
    this.showUsuarioEditar = true;
    this.showUsuarioRegistrar = false;
    this.showPersonaEditar = false;
    this.showPersonaRegistrar = false;
    this.showCategoriaRegistrar = false;
    this.showCategoriaEditar = false;
    this.showProductoEditar = false;
    this.showProductoRegistrar = false;
  }

  openCategoriaRegistrar(): void {
    this.showCategoriaRegistrar = true;
    this.showCategoriaEditar = false;
    this.showUsuarioEditar = false;
    this.showUsuarioRegistrar = false;
    this.showPersonaEditar = false;
    this.showPersonaRegistrar = false;
    this.showProductoEditar = false;
    this.showProductoRegistrar = false;
  }

  openCategoriaEditar(): void {
    this.showCategoriaEditar = true;
    this.showCategoriaRegistrar = false;
    this.showUsuarioEditar = false;
    this.showUsuarioRegistrar = false;
    this.showPersonaEditar = false;
    this.showPersonaRegistrar = false;
    this.showProductoEditar = false;
    this.showProductoRegistrar = false;
  }

  openProductoRegistrar(): void {
    this.showProductoRegistrar = true;
    this.showProductoEditar = false;
    this.showUsuarioEditar = false;
    this.showUsuarioRegistrar = false;
    this.showPersonaEditar = false;
    this.showPersonaRegistrar = false;
    this.showCategoriaRegistrar = false;
    this.showCategoriaEditar = false;
  }

  openProductoEditar(): void {
    this.showProductoEditar = true;
    this.showProductoRegistrar = false;
    this.showUsuarioEditar = false;
    this.showUsuarioRegistrar = false;
    this.showPersonaEditar = false;
    this.showPersonaRegistrar = false;
    this.showCategoriaRegistrar = false;
    this.showCategoriaEditar = false;
  }

  toggleMenu(menu: string, event: MouseEvent): void {
    event.stopPropagation();
    if (this.openMenu === menu) {
      this.openMenu = null;
    } else {
      this.openMenu = menu;
    }
  }

  onPersonaSaved(): void {
    this.notificationService.showExito('Persona guardada correctamente');
    this.showPersonaRegistrar = false;
    this.showPersonaEditar = false;
  }

  onUsuarioSaved(): void {
    this.notificationService.showExito('Usuario guardado correctamente');
    this.showUsuarioRegistrar = false;
    this.showUsuarioEditar = false;
  }

  onCategoriaSaved(): void {
    this.notificationService.showExito('Categoría guardada correctamente');
    this.showCategoriaRegistrar = false;
    this.showCategoriaEditar = false;
  }

  onProductoSaved(payload: any): void {
    this.notificationService.showExito('Producto guardado/actualizado correctamente');
    this.showProductoRegistrar = false;
    this.showProductoEditar = false;
  }

  onUsuarioCancel(): void {
    this.showUsuarioRegistrar = false;
    this.showUsuarioEditar = false;
  }

  onPersonaCancel(): void {
    this.showPersonaRegistrar = false;
    this.showPersonaEditar = false;
  }

  onCategoriaCancel(): void {
    this.showCategoriaRegistrar = false;
    this.showCategoriaEditar = false;
  }

  onProductoCancel(): void {
    this.showProductoRegistrar = false;
    this.showProductoEditar = false;
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
