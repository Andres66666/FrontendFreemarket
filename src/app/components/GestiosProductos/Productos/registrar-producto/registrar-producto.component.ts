import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Categoria, Producto } from '../../../../Models/models';
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
export class RegistrarProductoComponent {
  productoForm: FormGroup;
  categoria: Categoria[] = [];

  mensajeModal: string = ''; // Mensaje para el modal
  errorModal: string = '';

  constructor(
    private fb: FormBuilder,
    private productosService: ServicesService,
    private router: Router,
  ) {
    this.productoForm = fb.group({
      nombre_producto: ['', Validators.required],
      descripcion: ['', Validators.required],
      precio_compra: ['', [Validators.required, Validators.min(0)]],
      precio_unitario: ['', [Validators.required, Validators.min(0)]],
      precio_mayor: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      codigo_producto: ['', Validators.required],
      categoria: ['', Validators.required],
      imagen_productos: [''],
    });
  }
  ngOnInit(): void {
    this.loadCategorias();
  }
  loadCategorias() {
    this.productosService.getCategorias().subscribe((data) => {
      this.categoria = data;
    });
  }
  registrarProductos() {
    if (this.productoForm.valid) {
      const formData = new FormData();
      formData.append(
        'nombre_producto',
        this.productoForm.get('nombre_producto')?.value,
      );
      formData.append(
        'descripcion',
        this.productoForm.get('descripcion')?.value,
      );
      formData.append(
        'precio_compra',
        this.productoForm.get('precio_compra')?.value,
      );
      formData.append(
        'precio_unitario',
        this.productoForm.get('precio_unitario')?.value,
      );
      formData.append(
        'precio_mayor',
        this.productoForm.get('precio_mayor')?.value,
      );

      formData.append('stock', this.productoForm.get('stock')?.value);
      formData.append(
        'codigo_producto',
        this.productoForm.get('codigo_producto')?.value,
      );

      formData.append('categoria', this.productoForm.get('categoria')?.value);
      formData.append(
        'imagen_productos',
        this.productoForm.get('imagen_productos')?.value,
      );

      this.productosService
        .crearProducto(formData as unknown as Producto)
        .subscribe(
          (response) => {
            this.mensajeModal = 'Producto registrado con éxito';
            this.productoForm.reset(); // Restablece el formulario después del éxito
          },
          (error) => {
            this.errorModal = 'Error al registrar el producto';
          },
        );
    }
  }
  volver(): void {
    this.router.navigate(['panel-control/listar-productos']);
  }
  manejarOk() {
    this.mensajeModal = '';
    this.router.navigate(['panel-control/listar-productos']);
  }
  manejarError() {
    this.errorModal = '';
  }
}
