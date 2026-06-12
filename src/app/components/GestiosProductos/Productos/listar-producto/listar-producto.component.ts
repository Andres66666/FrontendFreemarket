import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Categoria, Producto } from '../../../../Models/models';
import { ServicesService } from '../../../../Services/services.service';

@Component({
  selector: 'app-listar-producto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './listar-producto.component.html',
  styleUrls: ['./listar-producto.component.css'],
})
export class ListarProductoComponent implements OnInit {
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  searchNombreProducto: string = '';
  searchCategoria: string = '';
  searchCodigoProducto: string = '';
  ordenarAscendente: boolean = true;



  nombresPorCategoria: string[] = [];
  constructor(
    private productoService: ServicesService,
    private router: Router,
  ) {}
  onCategoriaChange() {
    this.searchNombreProducto = '';
    this.actualizarNombresPorCategoria();
  }

  // Método para obtener nombres por categoría
  filterNamesByCategory(): Producto[] {
    if (!this.searchCategoria) {
      return this.productos.filter(p => p.estado_equipo !== false);
    }
    return this.productos.filter(
      p => p.estado_equipo !== false && 
      p.categoria.nombre_categoria.toLowerCase() === this.searchCategoria.toLowerCase()
    );
  }

  // Método auxiliar para actualizar nombres
  actualizarNombresPorCategoria() {
    const productos = this.filterNamesByCategory();
    this.nombresPorCategoria = [...new Set(productos.map(p => p.nombre_producto))].sort();
  }
  ngOnInit(): void {
    this.getProductos();
    this.getCategorias();
    this.actualizarNombresPorCategoria();
  }
  getProductos() {
    this.productoService.getProductos().subscribe((data) => {
      this.productos = data;
    });
  }

  getCategorias() {
    this.productoService.getCategorias().subscribe((data) => {
      this.categorias = data;
    });
  }

  editarProducto(id: number) {
    this.router.navigate(['panel-control/editar-productos', id]);
  }

  registrarProducto() {
    this.router.navigate(['panel-control/registrar-productos']);
  }
  ordenarPorStock() {
    this.ordenarAscendente = !this.ordenarAscendente; // Cambiar el estado de orden

    this.productos.sort((a, b) => {
      if (this.ordenarAscendente) {
        if (a.stock === 0) return -1; // Colocar productos con stock 0 al principio
        if (b.stock === 0) return 1; // Colocar productos con stock 0 al principio
        return a.stock - b.stock; // Ordenar normalmente
      } else {
        // Ordenar de mayor a menor
        if (a.stock === 0) return 1; // Colocar productos con stock 0 al final
        if (b.stock === 0) return -1; // Colocar productos con stock 0 al final
        return b.stock - a.stock; // Ordenar normalmente
      }
    });
  }

  filteredProductos(): Producto[] {
    let filtered = this.productos.filter(p => p.estado_equipo !== false);

    // 1. Filtrar por categoría
    if (this.searchCategoria) {
      filtered = filtered.filter(p => 
        p.categoria.nombre_categoria.toLowerCase() === this.searchCategoria.toLowerCase()
      );
    }

    // 2. Filtrar por nombre
    if (this.searchNombreProducto) {
      filtered = filtered.filter(p => 
        p.nombre_producto.toLowerCase() === this.searchNombreProducto.toLowerCase()
      );
    }

    // 3. Filtrar por código
    if (this.searchCodigoProducto) {
      const term = this.searchCodigoProducto.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.codigo_producto.toLowerCase().includes(term)
      );
    }

    // Stock cero primero
    const sinStock = filtered.filter(p => p.stock === 0);
    const conStock = filtered.filter(p => p.stock > 0);
    
    return [...sinStock, ...conStock];
  }
  modalVisible: boolean = false;
  imageToShow: string = '';
  openModal(imageUrl: string) {
    this.imageToShow = imageUrl;
    this.modalVisible = true;
  }
  closeModal() {
    this.modalVisible = false;
  }
  toggleProductoActivado(producto: Producto) {
    producto.estado_equipo = !producto.estado_equipo;
    this.productoService
      .actualizarEstadoProducto(producto.id, producto.estado_equipo)
      .subscribe(
        (response) => {
          console.log(
            `Producto ${producto.estado_equipo} actualizado exitosamente.`,
          );
        },
        (error) => {
          console.error('Error al actualizar el estado del equipo:', error);
          producto.estado_equipo = !producto.estado_equipo;
        },
      );
  }
}
