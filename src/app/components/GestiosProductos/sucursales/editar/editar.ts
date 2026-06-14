import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Sucursales } from '../../../../Models/models';
import { ServicesService } from '../../../../Services/services.service';

@Component({
  selector: 'app-editar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editar.html',
  styleUrl: './editar.css',
})
export class Editar implements OnInit {
  sucursal!: Sucursales;
  editarForm!: FormGroup;

  errorModal = '';

  constructor(
    private sucursalService: ServicesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.editarForm = new FormGroup({
      nombre: new FormControl('', Validators.required),
      direccion: new FormControl('', Validators.required),
      telefono: new FormControl('', Validators.required),
      estado: new FormControl(true),
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      this.loadSucursalData(id);
    }
  }

  loadSucursalData(id: number): void {
    this.sucursalService.getSucursalesById(id).subscribe({
      next: (data) => {
        this.sucursal = data;

        this.editarForm.patchValue({
          nombre: data.nombre,
          direccion: data.direccion,
          telefono: data.telefono,
          estado: data.estado,
        });
      },
      error: (error) => {
        console.error('Error al cargar la sucursal:', error);
        this.errorModal = 'Error al cargar la sucursal';
      },
    });
  }

  onSubmit(): void {
    if (this.editarForm.invalid) {
      this.editarForm.markAllAsTouched();
      this.errorModal = 'Complete todos los campos obligatorios';
      return;
    }

    const updatedSucursal: Sucursales = {
      ...this.sucursal,
      ...this.editarForm.value,
    };

    this.sucursalService
      .editarSucursales(this.sucursal.id, updatedSucursal)
      .subscribe({
        next: () => {
          // Redirigir automáticamente al listado
          this.router.navigate(['/panel-control/listar-sucursales']);
        },
        error: (error) => {
          console.error('Error al actualizar la sucursal:', error);
          this.errorModal = 'Error al actualizar la sucursal';
        },
      });
  }

  volver(): void {
    this.router.navigate(['/panel-control/listar-sucursales']);
  }

  manejarError(): void {
    this.errorModal = '';
  }
}