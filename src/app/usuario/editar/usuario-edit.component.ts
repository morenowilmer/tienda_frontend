import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-usuario-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario-edit.component.html',
  styleUrls: ['./usuario-edit.component.css']
})
export class UsuarioEditComponent {
  @Input() usuario: any | null = null;
  @Output() saved = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  usuarioForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.usuarioForm = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(40)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnChanges(): void {
    if (this.usuario) {
      this.usuarioForm.patchValue(this.usuario);
    }
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
