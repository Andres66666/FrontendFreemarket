import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';

import {
  Categoria,
  DetalleVenta,
  Producto,
  Venta,
} from '../../../../Models/models';
import { ServicesService } from '../../../../Services/services.service';

import { forkJoin } from 'rxjs';
import { ErrorComponent } from '../../../Mensajes/error/error.component';
import { OkComponent } from '../../../Mensajes/ok/ok.component';
import { EjBarraComponent } from '../../ej-barra/ej-barra.component';

@Component({
  selector: 'app-listar-productos-empleado',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    OkComponent,
    ErrorComponent,
    EjBarraComponent,
  ],
  templateUrl: './listar-productos-empleado.component.html',
  styleUrl: './listar-productos-empleado.component.css',
})
export class ListarProductosEmpleadoComponent implements OnInit {
  productos: Producto[] = [];
  categorias: Categoria[] = [];

  ok: string = '';
  error: string = '';

  // Responsive
  isMobile = false;

  // Sub-detalles por card (móvil)
  detallesAbiertos: boolean[] = [];

  searchNombreProducto: string = '';
  searchCategoria: string = '';
  searchPrecio: string = '';
  searchCodigoProducto: string = '';
  categoriaSeleccionada: Categoria | null = null;


  detalleVenta: DetalleVenta[] = [];
  totalVenta: number = 0;

  // cantidad por producto (input)
  cantidadPorProducto: { [key: number]: number } = {};
  nombresPorCategoria: string[] = [];
  // Forms
  ventaForm: FormGroup;
  detalleVentaForm: FormGroup;

  // Venta actual
  idVentaActual: number | null = null;

  usuario_id: number = 0;
  nombre_usuario: string = '';
  apellido: string = '';
  mostrarPrecioMayor: boolean = true; // default

  montoPagado: string = '';
  cambio: number = 0;

  isDesktop: boolean = false;
  modalVisible: boolean = false;
  imageToShow: string = '';
  isProcessingVenta = false;

  sucursal_id: number = 0;
  sucursal_nombre: string = '';
  constructor(
    private productoService: ServicesService,
    private fb: FormBuilder,
  ) {
    this.ventaForm = this.fb.group({
      usuario: ['', Validators.required],
      estado: ['Completada', Validators.required],
      total: [{ value: 0, disabled: true }],
    });

    this.detalleVentaForm = this.fb.group({
      producto: ['', Validators.required],
      cantidad: ['', [Validators.required, Validators.min(1)]],
      precio_unitario: ['', [Validators.required, Validators.min(0)]],
      precio_mayor: ['', [Validators.required, Validators.min(0)]],
      tipo_venta: ['mayor'],
    });
  }

  ngOnInit(): void {
    this.recuperarUsuario();
    this.getCategorias();
    this.detallesAbiertos = new Array(200).fill(false);

    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  cargarProductosSucursal() {
    if (!this.sucursal_id) {
      this.error = 'Usuario sin sucursal asignada';
      return;
    }

    this.productoService.getProductosPorSucursal(this.sucursal_id).subscribe({
      next: (productos) => {
        this.productos = productos;
        this.actualizarNombresPorCategoria();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al cargar productos de la sucursal';
      },
    });
  }

  getCategorias() {
    this.productoService.getCategorias().subscribe((data) => {
      this.categorias = data;
    });
  }

  recuperarUsuario() {
    const usuario = this.getUsuarioLocalStorage();

    if (!usuario) return;

    this.nombre_usuario = usuario.nombre_usuario || '';
    this.apellido = usuario.apellido || '';
    this.usuario_id = usuario.usuario_id || 0;
    this.sucursal_id = usuario.sucursal_id || 0;
    this.sucursal_nombre = usuario.sucursal_nombre || '';

    this.cargarProductosSucursal();

    const roles = this.productoService.getRolesFromLocalStorage();

    this.mostrarPrecioMayor = !this.tieneRolOcultarPrecio(roles);

    this.productoService.getUserById(this.usuario_id).subscribe((usuario) => {
      this.ventaForm.patchValue({
        usuario: usuario,
      });
    });
  }

  private getUsuarioLocalStorage() {
    if (typeof window === 'undefined') return null;
    try {
      const usuario = localStorage.getItem('usuario');
      return usuario ? JSON.parse(usuario) : null;
    } catch (error) {
      console.error('Error al recuperar usuario desde localStorage', error);
      return null;
    }
  }

  tieneRolOcultarPrecio(roles: string[]): boolean {
    const rolesOcultarPrecio = ['Empleado', 'Cajero', 'JefeDeEmpleado'];
    return roles.some((rol) => rolesOcultarPrecio.includes(rol));
  }
  onCategoriaChange() {
    this.searchNombreProducto = '';
    this.actualizarNombresPorCategoria();
  }
  filterNamesByCategory(): Producto[] {
    if (!this.searchCategoria) {
      return this.productos.filter(p => p.estado_equipo !== false);
    }
    return this.productos.filter(
      p => p.estado_equipo !== false && 
      p.categoria.nombre_categoria.toLowerCase() === this.searchCategoria.toLowerCase()
    );
  }
  actualizarNombresPorCategoria() {
    const productos = this.filterNamesByCategory();
    this.nombresPorCategoria = [...new Set(productos.map(p => p.nombre_producto))].sort();
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
      const searchTerm = this.searchCodigoProducto.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.codigo_producto.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }

  buscarPorCodigoEscaneado(codigo: string) {
    this.searchCodigoProducto = codigo;

    const productoEncontrado = this.productos.find(
      (p) => p.codigo_producto.toLowerCase() === codigo.toLowerCase(),
    );

    if (productoEncontrado) {
      this.agregarAlCarrito(productoEncontrado, 1, 'unidad');
    }

    this.filteredProductos();
  }

  clearQuantities() {
    this.searchCategoria = '';
    this.searchNombreProducto = '';
    this.searchCodigoProducto = '';
    this.cantidadPorProducto = {};
    this.actualizarNombresPorCategoria();
  }
  agregarAlCarrito(producto: Producto, cantidad: number, tipoPrecio: string) {
    if (cantidad <= 0 || cantidad > producto.stock) {
      this.error =
        'Cantidad inválida. No puede ser mayor al stock disponible ni menor a 1.';
      return;
    }

    const precioAplicado =
      tipoPrecio === 'mayor'
        ? Number(producto.precio_mayor)
        : Number(producto.precio_unitario);

    const existingDetail = this.detalleVenta.find(
      (d) => d.producto.id === producto.id,
    );

    if (existingDetail) {
      existingDetail.tipo_venta = tipoPrecio;
      existingDetail.precio = precioAplicado;
      existingDetail.subtotal = existingDetail.cantidad * precioAplicado;
    } else {
      const detalle: DetalleVenta = {
        id: this.detalleVenta.length + 1,
        venta: { id: 0 } as Venta,
        producto: producto,
        cantidad: cantidad,
        precio: precioAplicado,
        subtotal: cantidad * precioAplicado,
        tipo_venta: tipoPrecio,
      };

      this.detalleVenta.push(detalle);
    }

    this.actualizarTotalVenta();
  }

  actualizarCantidad(
    item: DetalleVenta | undefined,
    nuevaCantidad: number,
    tipoPrecio: string,
  ) {
    if (!item) return;

    if (nuevaCantidad < 1) {
      this.error = 'La cantidad no puede ser menor a 1.';
      return;
    }

    if (nuevaCantidad > item.producto.stock) {
      this.error = 'La cantidad no puede ser mayor al stock disponible.';
      return;
    }

    const precioUnitario =
      tipoPrecio === 'mayor'
        ? item.producto.precio_mayor
        : item.producto.precio_unitario;

    item.cantidad = nuevaCantidad;
    item.subtotal = nuevaCantidad * precioUnitario;

    item.tipo_venta = tipoPrecio;
    item.precio = precioUnitario;

    this.actualizarTotalVenta();
  }

  getDetalleVenta(productoId: number): DetalleVenta | undefined {
    return this.detalleVenta.find((d) => d.producto.id === productoId);
  }

  eliminarProducto(item: DetalleVenta) {
    this.detalleVenta = this.detalleVenta.filter((d) => d !== item);
    this.actualizarTotalVenta();
  }

  verificarCantidad(item: any) {
    if (item.cantidad > item.producto.stock) {
      item.cantidad = item.producto.stock;
    }
  }

  agregarDetalle() {
    if (!this.detalleVentaForm.valid) return;

    const nuevoDetalle: DetalleVenta = {
      ...this.detalleVentaForm.value,
      subtotal:
        this.detalleVentaForm.value.cantidad *
        this.detalleVentaForm.value.precio_unitario,
    };

    const existingDetail = this.detalleVenta.find(
      (d) => d.producto.id === nuevoDetalle.producto.id,
    );

    if (existingDetail) {
      existingDetail.cantidad = nuevoDetalle.cantidad;
      existingDetail.subtotal = nuevoDetalle.subtotal;
    } else {
      this.detalleVenta.push(nuevoDetalle);
    }

    this.detalleVentaForm.reset();
    this.actualizarTotalVenta();
  }

  actualizarTotalVenta() {
    this.totalVenta = this.detalleVenta.reduce(
      (total, item) => total + item.subtotal,
      0,
    );
    this.ventaForm.patchValue({ total: this.totalVenta });
    this.calcularCambio();
  }


  calcularTotal() {
    this.totalVenta = this.detalleVenta.reduce(
      (acc, item) => acc + item.subtotal,
      0,
    );
    this.ventaForm.patchValue({ total: this.totalVenta });
  }

  isCantidadValida(productoId: number, tipoPrecio: string): boolean {
    const cantidad = this.cantidadPorProducto[productoId];
    const producto = this.productos.find((p) => p.id === productoId);

    if (
      tipoPrecio === 'mayor' &&
      producto?.categoria.nombre_categoria === 'Tarjetas'
    ) {
      return cantidad >= 10;
    }

    return (
      !isNaN(cantidad) &&
      cantidad !== null &&
      cantidad !== undefined &&
      cantidad > 0
    );
  }

  isCategoriaConBotonUnidad(producto: Producto): boolean {
    return producto.categoria.nombre_categoria === 'Tarjetas';
  }

  registrarVenta() {
    if (this.isProcessingVenta) return;
    if (!(this.ventaForm.valid && this.detalleVenta.length > 0)) return;

    this.isProcessingVenta = true;
    this.error = '';
    this.ok = '';

    const { usuario, estado } = this.ventaForm.value;
    const nuevaVenta: Venta = {
      id: 0,
      usuario: { ...usuario },
      sucursal: {
        id: this.sucursal_id,
        nombre: this.sucursal_nombre,
        direccion: '',
        telefono: '',
        estado: true,
      },
      estado,
      total: this.totalVenta,
      fecha_venta: new Date(),
    };

    this.productoService.crearVenta(nuevaVenta).subscribe({
      next: (response) => {
        this.idVentaActual = response.id;
        this.registrarDetallesVenta();
      },
      error: (error) => {
        this.isProcessingVenta = false;
        console.error('Error al registrar la venta:', error);
        this.error = 'Error al registrar la venta.';
      },
    });
  }

  registrarDetallesVenta() {
    if (this.detalleVenta.length === 0) {
      this.isProcessingVenta = false;
      this.error = 'No hay detalles de venta para registrar.';
      return;
    }

    if (this.idVentaActual === null) {
      this.isProcessingVenta = false;
      this.error = 'No se ha registrado ninguna venta.';
      return;
    }

    const detallesParaEnviar = this.detalleVenta.map((item) => ({
      venta_id: this.idVentaActual!,
      producto_id: item.producto.id,
      cantidad: item.cantidad,
      precio: item.precio,
      subtotal: item.subtotal,
      tipo_venta: item.tipo_venta,
    }));

    console.log('📤 Enviando detalles:', detallesParaEnviar);

    // 🔥 AQUÍ LA MAGIA
    const requests = detallesParaEnviar.map((detalle) =>
      this.productoService.crearDetalleVenta(detalle),
    );

    forkJoin(requests).subscribe({
      next: (responses) => {
        console.log('✅ Todos los detalles creados', responses);

        this.cargarProductosSucursal();

        this.detalleVenta = [];
        this.totalVenta = 0;
        this.idVentaActual = null;
        this.montoPagado = '';
        this.cambio = 0;
        this.isProcessingVenta = false;

        this.ok = 'Venta registrada correctamente.';
      },
      error: (error) => {
        this.isProcessingVenta = false;
        console.error('❌ Error al registrar detalles:', error);
        this.error = 'Error al registrar detalles.';
      },
    });
  }

  calcularCambio() {
    const montoPagadoNum = parseFloat(this.montoPagado) || 0;
    this.cambio = montoPagadoNum - this.totalVenta;
  }

  formatNumber(value: number): string {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }


  toggleDetalles(index: number): void {
    this.detallesAbiertos[index] = !this.detallesAbiertos[index];
  }


  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    this.isMobile = window.innerWidth < 992;
    this.isDesktop = window.innerWidth >= 992;
  }
  irAlCarrito() {
    const elemento = document.getElementById('seccion-carrito');
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  openModal(imageUrl: string) {
    this.imageToShow = imageUrl;
    this.modalVisible = true;
  }

  closeModal() {
    this.modalVisible = false;
  }
  manejarOk() {
    this.ok = '';
  }

  manejarError() {
    this.error = '';
  }
}
