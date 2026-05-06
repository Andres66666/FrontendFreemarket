import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DetalleVenta } from '../../../Models/models';
import { ServicesService } from '../../../Services/services.service';

@Component({
  selector: 'app-listar-detalle-venta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './listar-detalle-venta.component.html',
  styleUrls: ['./listar-detalle-venta.component.css'],
})
export class ListarDetalleVentaComponent implements OnInit {
  // DATA
  detallesVenta: DetalleVenta[] = [];
  filteredList: DetalleVenta[] = [];
  paginatedDetallesVenta: DetalleVenta[] = [];

  //  FILTROS PROFESIONALES
  searchVenta = '';
  searchProducto = '';
  searchCodigo = '';
  searchFechaInicio = '';
  searchFechaFin = '';

  // Nuevos filtros SELECT
  selectedUsuarioId: number | '' = '';
  selectedCategoriaId: number | '' = '';
  selectedTipoVenta = '';

  // LISTAS DINÁMICAS PARA SELECTS
  uniqueUsuarios: any[] = [];
  uniqueCategorias: any[] = [];

  // PAGINACIÓN
  page = 1;
  pageSize = 10; // Aumentado para mejor UX
  loading = false;

  isAdmin = false;

  //  DEBOUNCE para filtros
  private filterTimeout: any;

  constructor(private servicesService: ServicesService) {}

  ngOnInit(): void {
    this.isAdmin = this.servicesService.isAdmin();
    this.getDetallesVenta();
  }
  // ==============================
  // DATA
  // ==============================
  getDetallesVenta() {
    this.servicesService.getDetalleVentas().subscribe((data) => {
      this.detallesVenta = data.sort(
        (a, b) =>
          new Date(b.venta.fecha_venta).getTime() -
          new Date(a.venta.fecha_venta).getTime(),
      );
      this.generateUniqueLists();
      this.applyFilters();
    });
  }

  onFilterChange() {
    clearTimeout(this.filterTimeout);
    this.filterTimeout = setTimeout(() => {
      this.applyFilters();
    }, 500);
  }
  private generateUniqueLists() {
    // Usuarios únicos (con validación)
    const usuariosSet = new Map();
    this.detallesVenta.forEach((d, index) => {
      const user = d.venta?.usuario;
      if (user && user.id) {
        usuariosSet.set(user.id, {
          id: Number(user.id), // 🔥 ASEGURAR NUMBER
          nombre_usuario: user.nombre_usuario,
          apellido: user.apellido || '',
          ci: user.ci || '',
        });
      } else {
      }
    });
    this.uniqueUsuarios = Array.from(usuariosSet.values());

    // Categorías únicas (con validación)
    const categoriasSet = new Map();
    this.detallesVenta.forEach((d, index) => {
      const cat = d.producto?.categoria;
      if (cat && cat.id) {
        categoriasSet.set(cat.id, {
          id: Number(cat.id), // 🔥 ASEGURAR NUMBER
          nombre_categoria: cat.nombre_categoria || '',
        });
      }
    });
    this.uniqueCategorias = Array.from(categoriasSet.values());
  }

  // ==============================
  // FILTROS (OPTIMIZADO)
  // ==============================
  applyFilters() {
    this.loading = true;
    setTimeout(() => {
      let filtered = this.detallesVenta;

      // 1. ID Venta
      if (this.searchVenta) {
        filtered = filtered.filter((d) =>
          d.venta.id.toString().includes(this.searchVenta),
        );
      }

      // 2. Usuario (CORREGIDO)
      if (this.selectedUsuarioId !== '' && this.selectedUsuarioId !== null) {
        const usuarioIdNum = Number(this.selectedUsuarioId);
        filtered = filtered.filter((d) => {
          const match = d.venta?.usuario?.id === usuarioIdNum;
          return match;
        });
      }

      // 3. Categoría (CORREGIDO)
      if (
        this.selectedCategoriaId !== '' &&
        this.selectedCategoriaId !== null
      ) {
        const categoriaIdNum = Number(this.selectedCategoriaId);
        filtered = filtered.filter((d) => {
          const catId = d.producto?.categoria?.id;
          const match = catId === categoriaIdNum;
          return match;
        });
      }

      if (this.searchProducto) {
        filtered = filtered.filter((d) =>
          d.producto.nombre_producto
            .toLowerCase()
            .includes(this.searchProducto.toLowerCase()),
        );
      }

      if (this.searchCodigo) {
        filtered = filtered.filter((d) =>
          d.producto.codigo_producto
            .toLowerCase()
            .includes(this.searchCodigo.toLowerCase()),
        );
      }

      if (this.searchFechaInicio) {
        const fi = new Date(this.searchFechaInicio).getTime();
        filtered = filtered.filter(
          (d) => new Date(d.venta.fecha_venta).getTime() >= fi,
        );
      }

      if (this.searchFechaFin) {
        const ff = new Date(this.searchFechaFin + 'T23:59:59').getTime();
        filtered = filtered.filter(
          (d) => new Date(d.venta.fecha_venta).getTime() <= ff,
        );
      }

      if (this.selectedTipoVenta) {
        filtered = filtered.filter(
          (d) =>
            d.tipo_venta.toLowerCase() === this.selectedTipoVenta.toLowerCase(),
        );
      }

      this.filteredList = filtered;
      this.page = 1;
      this.updatePaginatedDetallesVenta();
      this.loading = false;
    }, 100);
  }

  // ==============================
  // PAGINACIÓN
  // ==============================

  limpiarFiltros() {
    this.searchVenta = '';
    this.searchProducto = '';
    this.searchCodigo = '';
    this.searchFechaInicio = '';
    this.searchFechaFin = '';
    this.selectedUsuarioId = '';
    this.selectedCategoriaId = '';
    this.selectedTipoVenta = '';
    this.applyFilters();
  }
  get totalPages(): number {
    return Math.ceil(this.filteredList.length / this.pageSize);
  }

  get pages(): number[] {
    return Array(this.totalPages)
      .fill(0)
      .map((x, i) => i + 1);
  }

  updatePaginatedDetallesVenta() {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedDetallesVenta = this.filteredList.slice(start, end);
  }

  goToPage(pageNum: number) {
    this.page = pageNum;
    this.updatePaginatedDetallesVenta();
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.updatePaginatedDetallesVenta();
    }
  }

  previousPage() {
    if (this.page > 1) {
      this.page--;
      this.updatePaginatedDetallesVenta();
    }
  }

  // ==============================
  // CALCULOS
  // ==============================

  // AGREGAR ESTE MÉTODO PARA LIMPIAR DATOS

  private sanitizeNumber(value: any): number {
    if (
      value === null ||
      value === undefined ||
      value === '' ||
      value === 'null'
    ) {
      return 0;
    }
    // Convertir string a número limpiamente
    const num = parseFloat(String(value).replace(/[^\d.-]/g, ''));
    return isNaN(num) ? 0 : num;
  }

  // ==============================
  // TOTALES (CON SANITIZACIÓN)
  // ==============================
  getTotalCantidad(): number {
    return this.filteredList.reduce((sum, d) => sum + d.cantidad, 0);
  }

  getTotalPrecio(): number {
    return this.filteredList.reduce(
      (sum, d) => sum + this.sanitizeNumber(d.precio),
      0,
    );
  }

  getTotalSubtotal(): number {
    return this.filteredList.reduce(
      (sum, d) => sum + this.sanitizeNumber(d.subtotal),
      0,
    );
  }

  getTotalCosto(): number {
    return this.filteredList.reduce((sum, d) => sum + this.calcularCosto(d), 0);
  }

  getTotalGanancia(): number {
    return this.filteredList.reduce(
      (sum, d) => sum + this.calcularGanancia(d),
      0,
    );
  }

  // desde aqui
  // Métodos específicos para precios (más robustos)
  getPrecioCompra(detalle: DetalleVenta): number {
    return this.sanitizeNumber(detalle.producto?.precio_compra);
  }

  getPrecioUnitario(detalle: DetalleVenta): number {
    return this.sanitizeNumber(detalle.producto?.precio_unitario);
  }

  getPrecioMayor(detalle: DetalleVenta): number {
    return this.sanitizeNumber(detalle.producto?.precio_mayor);
  }

  calcularCosto(detalle: DetalleVenta): number {
    return this.getPrecioCompra(detalle) * detalle.cantidad;
  }

  calcularGanancia(detalle: DetalleVenta): number {
    return detalle.subtotal - this.calcularCosto(detalle);
  }
  getTotalPrecioCompra(): number {
    return this.filteredList.reduce(
      (sum, d) => sum + this.getPrecioCompra(d) * d.cantidad,
      0,
    );
  }

  getTotalPrecioUnitario(): number {
    return this.filteredList.reduce(
      (sum, d) => sum + this.getPrecioUnitario(d) * d.cantidad,
      0,
    );
  }

  getTotalPrecioMayor(): number {
    return this.filteredList.reduce(
      (sum, d) => sum + this.getPrecioMayor(d) * d.cantidad,
      0,
    );
  }
}
