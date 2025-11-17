import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-usuario-register',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario-register.component.html',
  styleUrls: ['./usuario-register.component.css']
})
export class UsuarioRegisterComponent {
  @Output() saved = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  usuarioForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.usuarioForm = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(40)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() { return this.usuarioForm.controls; }

  onSubmit(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }
    this.saved.emit({ ...this.usuarioForm.value });
  }

  onCancel(): void { this.cancel.emit(); }
}
