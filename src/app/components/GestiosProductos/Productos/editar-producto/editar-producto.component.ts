import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Categoria, Producto } from '../../../../Models/models';
import { ServicesService } from '../../../../Services/services.service';
import { ErrorComponent } from '../../../Mensajes/error/error.component';
import { OkComponent } from '../../../Mensajes/ok/ok.component';

@Component({
  selector: 'app-editar-producto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, OkComponent, ErrorComponent],
  templateUrl: './editar-producto.component.html',
  styleUrls: ['./editar-producto.component.css'],
})
export class EditarProductoComponent implements OnInit {
  producto!: Producto;
  categorias: Categoria[] = [];
  form!: FormGroup;
  mensajeModal: string = '';
  errorModal: string = '';

  constructor(
    private productosService: ServicesService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadProductoData(id);
      this.loadCategorias();
    }
  }

  loadProductoData(id: number) {
    this.productosService.getProductoById(id).subscribe({
      next: (data) => {
        this.producto = data;
        this.initializeForm();
        // Asegurar que la URL de la imagen sea correcta
      },
      error: (err) => {
        console.error('Error cargando producto:', err);
      },
    });
  }

  loadCategorias() {
    this.productosService.getCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (err) => {
        console.error('Error cargando categorías:', err);
      },
    });
  }

  initializeForm() {
    this.form = new FormGroup({
      nombre_producto: new FormControl(
        this.producto.nombre_producto,
        Validators.required,
      ),
      descripcion: new FormControl(this.producto.descripcion),
      precio_compra: new FormControl(this.producto.precio_compra, [
        Validators.required,
        Validators.min(0),
      ]),
      precio_unitario: new FormControl(this.producto.precio_unitario, [
        Validators.required,
        Validators.min(0),
      ]),
      precio_mayor: new FormControl(this.producto.precio_mayor, [
        Validators.required,
        Validators.min(0),
      ]),
      stock: new FormControl(this.producto.stock, [
        Validators.required,
        Validators.min(0),
      ]),
      codigo_producto: new FormControl(
        this.producto.codigo_producto,
        Validators.required,
      ),
      categoria: new FormControl(
        this.producto.categoria.id,
        Validators.required,
      ),
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      // 🔥 CAMBIADO: Objeto simple en lugar de FormData
      const productoData: Producto = {
        id: this.producto.id,
        nombre_producto: this.form.value.nombre_producto,
        descripcion: this.form.value.descripcion || '',
        precio_compra: this.form.value.precio_compra,
        precio_unitario: this.form.value.precio_unitario,
        precio_mayor: this.form.value.precio_mayor,
        stock: this.form.value.stock,
        codigo_producto: this.form.value.codigo_producto,
        categoria: { id: this.form.value.categoria } as Categoria,
        estado_equipo: this.producto.estado_equipo,
        fecha_creacion: this.producto.fecha_creacion,
        fecha_actualizacion: new Date(),
      };

      this.productosService
        .actualizarProducto(this.producto.id, productoData) // 🔥 Ya no FormData
        .subscribe({
          next: () => {
            this.mensajeModal = 'Producto actualizado con éxito';
          },
          error: (err) => {
            console.error('Error actualizando producto:', err);
            this.errorModal = 'Error al actualizar el producto';
          },
        });
    }
  }
  manejarOk(): void {
    this.mensajeModal = '';
    this.router.navigate(['panel-control/listar-productos']);
  }
  volver(): void {
    this.router.navigate(['panel-control/listar-productos']);
  }
  manejarError() {
    this.errorModal = '';
  }
}
