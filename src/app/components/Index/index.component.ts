import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import {
  Categoria,
  Producto,
  Sucursales
} from '../../Models/models';

import { ServicesService } from '../../Services/services.service';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css'],
})
export class IndexComponent implements OnInit {

  // ==========================
  // DATOS
  // ==========================

  productos: Producto[] = [];
  categorias: Categoria[] = [];
  sucursales: Sucursales[] = [];

  // ==========================
  // FILTROS
  // ==========================

  buscar: string = '';

  categoriaSeleccionada: number = 0;
  // FILTROS
  
  sucursalSeleccionada: number = 0;
  // ==========================
  // CONSTRUCTOR
  // ==========================

  constructor(
    private router: Router,
    private api: ServicesService
  ) {}

  // ==========================
  // INIT
  // ==========================

  ngOnInit(): void {
    this.obtenerCategorias();
    this.obtenerProductos();
    this.obtenerSucursales();
  }

  // ==========================
  // NAVEGACIÓN
  // ==========================

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  // ==========================
  // API
  // ==========================

  obtenerProductos(): void {
    this.api.getProductos().subscribe({
      next: (resp) => {

        this.productos = resp.filter(
          producto => producto.estado_equipo
        );

      },
      error: (err) => {
        console.error('Error cargando productos', err);
      },
    });
  }

  obtenerCategorias(): void {
    this.api.getCategorias().subscribe({
      next: (resp) => {

        this.categorias = resp.filter(
          categoria => categoria.estado_categoria
        );

      },
      error: (err) => {
        console.error('Error cargando categorías', err);
      },
    });
  }

  obtenerSucursales(): void {
    this.api.getSucursales().subscribe({
      next: (resp) => {

        this.sucursales = resp.filter(
          sucursal => sucursal.estado
        );

      },
      error: (err) => {
        console.error('Error cargando sucursales', err);
      },
    });
  }
  get celularesHero(): Producto[] {
    return this.productos
      .filter(
        p =>
          p.categoria?.nombre_categoria
            ?.toLowerCase()
            .includes('celular')
      )
      .slice(0, 5);
  }
  // ==========================
  // CATEGORÍAS
  // ==========================

  seleccionarCategoria(id: number): void {
    this.categoriaSeleccionada = id;
  }

  mostrarTodos(): void {
    this.categoriaSeleccionada = 0;
  }

  // ==========================
  // PRODUCTOS FILTRADOS
  // ==========================
get productosFiltrados(): Producto[] {

  let productos = [...this.productos];

  // Categoría
  if (this.categoriaSeleccionada !== 0) {
    productos = productos.filter(
      p => p.categoria?.id === this.categoriaSeleccionada
    );
  }

  // Sucursal
  if (this.sucursalSeleccionada !== 0) {
    productos = productos.filter(
      p => p.sucursal?.id === this.sucursalSeleccionada
    );
  }

  // Nombre
  if (this.buscar.trim()) {
    productos = productos.filter(
      p =>
        p.nombre_producto
          .toLowerCase()
          .includes(this.buscar.toLowerCase())
    );
  }

  return productos;
}

  // ==========================
  // PRODUCTOS DESTACADOS
  // ==========================

  get productosDestacados(): Producto[] {
    return this.productos.slice(0, 8);
  }

  // ==========================
  // WHATSAPP
  // ==========================

  abrirWhatsapp(producto: Producto): void {

    const mensaje =
      `Hola 👋 estoy interesado en el producto:\n\n` +
      `📱 ${producto.nombre_producto}\n` +
      `💰 Bs. ${producto.precio_unitario}\n\n` +
      `¿Podría brindarme más información?`;

    window.open(
      `https://wa.me/59172937437?text=${encodeURIComponent(mensaje)}`,
      '_blank'
    );
  }

  // ==========================
  // IMAGEN POR DEFECTO
  // ==========================

  imagenError(event: any): void {

    event.target.src =
      'https://via.placeholder.com/300x300?text=Sin+Imagen';

  }

  // ==========================
  // TRACK BY
  // ==========================

  trackProducto(index: number, producto: Producto): number {
    return producto.id;
  }

  trackCategoria(index: number, categoria: Categoria): number {
    return categoria.id;
  }

  trackSucursal(index: number, sucursal: Sucursales): number {
    return sucursal.id;
  }

}