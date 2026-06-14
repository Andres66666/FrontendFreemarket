import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ServicesService } from '../../../../Services/services.service';
import { Sucursales, Usuario } from '../../../../Models/models';

import { OkComponent } from '../../../Mensajes/ok/ok.component';
import { ErrorComponent } from '../../../Mensajes/error/error.component';

@Component({
  selector: 'app-editar-usuario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    OkComponent,
    ErrorComponent,
  ],
  templateUrl: './editar-usuario.component.html',
  styleUrls: ['./editar-usuario.component.css'],
})
export class EditarUsuarioComponent implements OnInit {
  usuario!: Usuario;

  sucursales: Sucursales[] = [];

  mensajeNombre = '';
  exitoNombre = false;

  imagenPreview: string | ArrayBuffer | null = null;

  mensajeModal = '';
  errorModal = '';

  editarForm = new FormGroup({
    nombre_usuario: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    apellido: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    fecha_nacimiento: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    telefono: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    correo: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),

    ci: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    ci_departamento: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    sucursal_id: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),

    imagen_url: new FormControl<File | string | null>(null),
  });

  constructor(
    private servicesService: ServicesService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.getSucursales();

    if (id) {
      this.loadUserData(id);
    }
  }

  getSucursales(): void {
    this.servicesService.getSucursales().subscribe({
      next: (data) => {
        this.sucursales = data.filter((s) => s.estado);
      },
      error: (error) => {
        console.error('Error al cargar sucursales', error);
        this.errorModal = 'Error al cargar sucursales';
      },
    });
  }

  loadUserData(id: number): void {
    this.servicesService.getUserById(id).subscribe({
      next: (data) => {
        this.usuario = data;

        const fecha = data.fecha_nacimiento
          ? new Date(data.fecha_nacimiento)
              .toISOString()
              .split('T')[0]
          : '';

        this.editarForm.patchValue({
          nombre_usuario: data.nombre_usuario,
          apellido: data.apellido,
          fecha_nacimiento: fecha,
          telefono: data.telefono,
          correo: data.correo,
          ci: data.ci,
          ci_departamento: data.ci_departamento,
          sucursal_id: data.sucursal?.id ?? null,
          imagen_url: data.imagen_url,
        });

        this.imagenPreview = data.imagen_url;
      },
      error: (error) => {
        console.error(error);
        this.errorModal = 'Error al cargar los datos del usuario';
      },
    });
  }

  onImageChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      this.imagenPreview = reader.result;
    };

    reader.readAsDataURL(file);

    this.editarForm.patchValue({
      imagen_url: file,
    });
  }

  onSubmit(): void {
    if (this.editarForm.invalid) {
      this.editarForm.markAllAsTouched();

      this.errorModal =
        'Por favor complete todos los campos requeridos';

      return;
    }

    if (!this.usuario) {
      this.errorModal = 'Usuario no encontrado';
      return;
    }

    const updateUsuario = new FormData();

    updateUsuario.append(
      'nombre_usuario',
      this.editarForm.controls.nombre_usuario.value
    );

    updateUsuario.append(
      'apellido',
      this.editarForm.controls.apellido.value
    );

    updateUsuario.append(
      'fecha_nacimiento',
      this.editarForm.controls.fecha_nacimiento.value
    );

    updateUsuario.append(
      'telefono',
      this.editarForm.controls.telefono.value
    );

    updateUsuario.append(
      'correo',
      this.editarForm.controls.correo.value
    );

    updateUsuario.append(
      'ci',
      this.editarForm.controls.ci.value
    );

    updateUsuario.append(
      'ci_departamento',
      this.editarForm.controls.ci_departamento.value
    );

    updateUsuario.append(
      'sucursal_id',
      String(this.editarForm.controls.sucursal_id.value)
    );

    const imagen = this.editarForm.controls.imagen_url.value;

    if (imagen instanceof File) {
      updateUsuario.append('imagen_url', imagen);
    }

    this.servicesService
      .editarUsuario(this.usuario.id, updateUsuario)
      .subscribe({
        next: () => {
          this.mensajeModal =
            'Usuario actualizado exitosamente';
        },
        error: (error) => {
          console.error(error);
          this.errorModal =
            'Error al actualizar el usuario';
        },
      });
  }

  manejarOk(): void {
    this.mensajeModal = '';
    this.router.navigate(['panel-control/listar-usuarios']);
  }

  volver(): void {
    this.router.navigate(['panel-control/listar-usuarios']);
  }

  manejarError(): void {
    this.errorModal = '';
  }

  validarNombre(
    event: FocusEvent | KeyboardEvent | null = null
  ): boolean {
    let inputElement: HTMLInputElement | null;

    inputElement = event
      ? (event.target as HTMLInputElement)
      : (document.getElementById(
          'nombre_usuario'
        ) as HTMLInputElement);

    const nombre = inputElement.value.trim();

    if (event instanceof FocusEvent && !nombre) {
      this.mensajeNombre =
        'Ingresa su nombre, por favor';

      inputElement.classList.add('is-invalid');

      return false;
    }

    if (event instanceof KeyboardEvent) {
      const char = String.fromCharCode(event.keyCode);

      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]$/.test(char)) {
        event.preventDefault();

        this.mensajeNombre =
          'No se puede ingresar datos numéricos';

        inputElement.classList.add('is-invalid');

        return false;
      }
    }

    if (nombre) {
      this.mensajeNombre = 'Datos correctos';

      inputElement.classList.remove('is-invalid');
      inputElement.classList.add('is-valid');

      setTimeout(() => {
        this.mensajeNombre = '';
      }, 2000);
    }

    return true;
  }
}