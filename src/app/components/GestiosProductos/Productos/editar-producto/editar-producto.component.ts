import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Categoria, Producto, Sucursales } from '../../../../Models/models';
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
  sucursales: Sucursales[] = [];
  form!: FormGroup;
  mensajeModal: string = '';
  errorModal: string = '';
  imagenSeleccionada: File | null = null;
  imagenPreview: string | null = null;
  constructor(
    private productosService: ServicesService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}


  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.loadCategorias();
    this.loadSucursales();

    if (id) {
      this.loadProductoData(id);
    }
  }
  loadSucursales(): void {
    this.productosService.getSucursales().subscribe({
      next: (data) => {
        this.sucursales = data.filter(
          (sucursal) => sucursal.estado
        );
      },
      error: (err) => {
        console.error('Error cargando sucursales:', err);
      },
    });
  }
  loadProductoData(id: number) {
    this.productosService.getProductoById(id).subscribe({
      next: (data) => {
        this.producto = data;
        this.imagenPreview = data.imagen_productos;
        this.initializeForm();
      },
      error: (err) => {
        console.error('Error cargando producto:', err);
      },
    });
  }
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.imagenSeleccionada = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
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
        Validators.required
      ),

      descripcion: new FormControl(
        this.producto.descripcion
      ),

      precio_compra: new FormControl(
        this.producto.precio_compra,
        [Validators.required, Validators.min(0)]
      ),

      precio_unitario: new FormControl(
        this.producto.precio_unitario,
        [Validators.required, Validators.min(0)]
      ),

      precio_mayor: new FormControl(
        this.producto.precio_mayor,
        [Validators.required, Validators.min(0)]
      ),

      stock: new FormControl(
        this.producto.stock,
        [Validators.required, Validators.min(0)]
      ),

      codigo_producto: new FormControl(
        this.producto.codigo_producto,
        Validators.required
      ),

      categoria: new FormControl(
        this.producto.categoria.id,
        Validators.required
      ),

      // NUEVO
      sucursal_id: new FormControl(
        this.producto.sucursal?.id,
        Validators.required
      ),
    });
  }
  onSubmit(): void {
  if (this.form.valid) {

    const formData = new FormData();

    formData.append(
      'nombre_producto',
      this.form.value.nombre_producto
    );

    formData.append(
      'descripcion',
      this.form.value.descripcion || ''
    );

    formData.append(
      'precio_compra',
      this.form.value.precio_compra
    );

    formData.append(
      'precio_unitario',
      this.form.value.precio_unitario
    );

    formData.append(
      'precio_mayor',
      this.form.value.precio_mayor
    );

    formData.append(
      'stock',
      this.form.value.stock
    );

    formData.append(
      'codigo_producto',
      this.form.value.codigo_producto
    );

    formData.append(
      'categoria',
      this.form.value.categoria
    );
    formData.append(
      'sucursal_id',
      this.form.value.sucursal_id
    );

    // Nueva imagen (opcional)
    if (this.imagenSeleccionada) {
      formData.append(
        'imagen_productos',
        this.imagenSeleccionada
      );
    }

    this.productosService
      .actualizarProducto(this.producto.id, formData)
      .subscribe({
        next: () => {
          this.mensajeModal = 'Producto actualizado con éxito';
        },
        error: (err) => {
          console.error(err);
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
