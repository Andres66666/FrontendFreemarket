import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import {
  Categoria,
  Producto,
  Sucursales,
} from '../../../../Models/models';

import { ServicesService } from '../../../../Services/services.service';

import { ErrorComponent } from '../../../Mensajes/error/error.component';
import { OkComponent } from '../../../Mensajes/ok/ok.component';

@Component({
  selector: 'app-registrar-producto',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    OkComponent,
    ErrorComponent,
  ],
  templateUrl: './registrar-producto.component.html',
  styleUrl: './registrar-producto.component.css',
})
export class RegistrarProductoComponent implements OnInit {
  productoForm: FormGroup;

  categoria: Categoria[] = [];
  sucursales: Sucursales[] = [];

  mensajeModal: string = '';
  errorModal: string = '';

  selectedFile: File | null = null;
  previewImage: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private productosService: ServicesService,
    private router: Router
  ) {
    this.productoForm = this.fb.group({
      nombre_producto: ['', Validators.required],
      descripcion: ['', Validators.required],
      precio_compra: ['', [Validators.required, Validators.min(0)]],
      precio_unitario: ['', [Validators.required, Validators.min(0)]],
      precio_mayor: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      codigo_producto: ['', Validators.required],
      categoria: ['', Validators.required],

      // NUEVO
      sucursal_id: ['', Validators.required],

      imagen_productos: [''],
    });
  }

  ngOnInit(): void {
    this.loadCategorias();
    this.loadSucursales();
  }

  loadCategorias(): void {
    this.productosService.getCategorias().subscribe({
      next: (data) => {
        this.categoria = data;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  loadSucursales(): void {
    this.productosService.getSucursales().subscribe({
      next: (data) => {
        this.sucursales = data.filter(
          (sucursal) => sucursal.estado
        );
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  registrarProductos(): void {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();

    formData.append(
      'nombre_producto',
      this.productoForm.get('nombre_producto')?.value
    );

    formData.append(
      'descripcion',
      this.productoForm.get('descripcion')?.value
    );

    formData.append(
      'precio_compra',
      this.productoForm.get('precio_compra')?.value
    );

    formData.append(
      'precio_unitario',
      this.productoForm.get('precio_unitario')?.value
    );

    formData.append(
      'precio_mayor',
      this.productoForm.get('precio_mayor')?.value
    );

    formData.append(
      'stock',
      this.productoForm.get('stock')?.value
    );

    formData.append(
      'codigo_producto',
      this.productoForm.get('codigo_producto')?.value
    );

    formData.append(
      'categoria',
      this.productoForm.get('categoria')?.value
    );

    // NUEVO
    formData.append(
      'sucursal_id',
      this.productoForm.get('sucursal_id')?.value
    );

    if (this.selectedFile) {
      formData.append(
        'imagen_productos',
        this.selectedFile
      );
    }

    this.productosService
      .crearProducto(formData)
      .subscribe({
        next: () => {
          this.mensajeModal = 'Producto registrado con éxito';
        },
        error: (error) => {
          console.log('ERROR COMPLETO:', error);
          console.log('ERROR BACKEND:', error.error);

          this.errorModal = JSON.stringify(error.error);
        },
      });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];

    if (file) {
      this.selectedFile = file;

      const reader = new FileReader();

      reader.onload = () => {
        this.previewImage = reader.result;
      };

      reader.readAsDataURL(file);
    }
  }

  volver(): void {
    this.router.navigate([
      'panel-control/listar-productos',
    ]);
  }

  manejarOk(): void {
    this.mensajeModal = '';
    this.router.navigate([
      'panel-control/listar-productos',
    ]);
  }

  manejarError(): void {
    this.errorModal = '';
  }
}