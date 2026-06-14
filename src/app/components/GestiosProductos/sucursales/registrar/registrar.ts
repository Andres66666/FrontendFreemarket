import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormGroup, Validators, FormBuilder, } from '@angular/forms';
import { OkComponent } from '../../../Mensajes/ok/ok.component';
import { ErrorComponent } from '../../../Mensajes/error/error.component';
import { ServicesService } from '../../../../Services/services.service';

@Component({
  selector: 'app-registrar',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule,OkComponent, ErrorComponent,],
  templateUrl: './registrar.html',
  styleUrl: './registrar.css',
})
export class Registrar {

  sucursalForm: FormGroup;
  errorModal: string = '';
  mensajeModal: string = '';
  
 constructor(private fb: FormBuilder, private Service: ServicesService, private router: Router) {
    this.sucursalForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      telefono: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{7,10}$/),
        ],
      ],
    });
  }
  register() {
    if (this.sucursalForm.invalid) {
      this.sucursalForm.markAllAsTouched();

      this.errorModal =
        'Por favor complete todos los campos correctamente.';
      return;
    }

    const newSucursal = {
      id: 0,
      ...this.sucursalForm.value,
      estado: true,
    };

    this.Service.registrarSucursales(newSucursal).subscribe({
      next: () => {
        this.mensajeModal = 'Sucursal registrada exitosamente.';
        this.errorModal = '';

        this.sucursalForm.reset({
          estado: true,
        });
      },
      error: (error) => {
        console.error(error);

        this.errorModal =
          error?.error?.message ||
          'Error al registrar la sucursal.';

        this.mensajeModal = '';
      },
    });
  }
  volver(): void {
    this.router.navigate(['/panel-control/listar-sucursales']);
  }
  manejarOk() {
    this.mensajeModal = '';
    this.router.navigate(['/panel-control/listar-sucursales']);
  }
  manejarError() {
    this.errorModal = '';
  }
}
