import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../data/services/login.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  form!: FormGroup;

  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder, 
    private loginService: LoginService, 
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      usuario: ['', Validators.required],
      contrasena: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.notificationService.showAlerta('Por favor, complete todos los campos');
      return;
    }
    this.loading = true;
    this.error = null;

    const { usuario, contrasena } = this.form.value as { usuario: string; contrasena: string };

    this.loginService.login(usuario, contrasena).subscribe({
      next: (res: any) => {
        const token = res?.respuesta?.token ?? null;
        const nombreUsuario = res?.respuesta?.nombreUsuario ?? null;
        if (token && nombreUsuario) {
          sessionStorage.setItem('token', token);
          sessionStorage.setItem('nombreUsuario', nombreUsuario);
          this.router.navigate(['/home']);
        } else {
          const msg = res?.mensaje ?? 'Error al intentar iniciar sesión';
          this.notificationService.showError(msg);
          this.loading = false;
        }
      },
      error: (err: any) => {
        const mensajeErrorGenerico = 'Error general del sistema';
        if (err && err.status === 403) {
          const msg = err.error?.mensaje ?? mensajeErrorGenerico;
          this.notificationService.showError(msg);
        } else {          
          this.notificationService.showError(mensajeErrorGenerico);
        }
        this.loading = false;
      }
    });
  }

}
