import { Component, ViewChild } from '@angular/core';
import { ServicesService } from '../../Services/services.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  @ViewChild('loginModal') loginModal: any;
  showPassword: boolean = false;
  correo: string = '';
  password: string = '';
  mensaje: string = '';
  error: string = '';
  isLoading: boolean = false;

  constructor(
    private servicesService: ServicesService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.error = 'Verifica tu correo y contraseña.';
      return;
    }

    this.isLoading = true;

    this.servicesService.login(this.correo, this.password)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe(
        (response) => {
          const token = response.access_token;
          if (token) {
            this.mensaje = 'Inicio de sesión exitoso. ¡Bienvenido!';
            this.error = '';
          }
        },
        (err: HttpErrorResponse) => {
          if (err.status === 403) {
            this.error =
              'No tienes roles ni permisos asignados. Comunícate con el administrador.';
          } else if (err.status === 404) {
            this.error = 'Usuario no encontrado. Verifica tus credenciales.';
          } else if (err.status === 0) {
            this.error = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
          } else {
            this.error =
              err.error?.error ||
              'Error en el servidor. Intenta nuevamente más tarde.';
          }
          this.mensaje = '';
        }
      );
  }

  closeMessage(): void {
    if (this.mensaje) {
      this.router.navigate(['/panel-control']);
    }
    this.mensaje = '';
    this.error = '';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  isFormValid(): boolean {
    return this.isEmailValid(this.correo) && this.isPasswordValid(this.password);
  }

  isEmailValid(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com|hotmail\.com)$/;
    return emailPattern.test(email);
  }

  isPasswordValid(password: string): boolean {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,}$/;
    return passwordPattern.test(password);
  }

  navigateToHome(): void {
    this.router.navigate(['/index']);
  }
}