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
  Usuario,
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
  ventas: Venta[] = [];
  usuarios: Usuario[] = [];
  detalleVentas: DetalleVenta[] = [];

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

  page: number = 1;
  pageSize: number = 6;

  detalleVenta: DetalleVenta[] = [];
  totalVenta: number = 0;

  // cantidad por producto (input)
  cantidadPorProducto: { [key: number]: number } = {};

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
  numeroTelefono: string = '';

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
    this.getUsuarios();
    this.getProductos();
    this.getCategorias();
    this.getVentas();

    this.recuperarUsuario();

    this.detallesAbiertos = new Array(200).fill(false);

    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  getVentas() {
    this.productoService.getVentas().subscribe((data) => {
      this.ventas = data;
    });
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

  getUsuarios() {
    this.productoService.getUsuarios().subscribe((data) => {
      this.usuarios = data;
    });
  }

  recuperarUsuario() {
    const usuario = this.getUsuarioLocalStorage();
    if (!usuario) return;

    this.nombre_usuario = usuario.nombre_usuario || '';
    this.apellido = usuario.apellido || '';
    this.usuario_id = usuario.usuario_id || 0;

    const roles = this.productoService.getRolesFromLocalStorage();
    this.mostrarPrecioMayor = !this.tieneRolOcultarPrecio(roles);

    this.productoService
      .verificarUsuario(this.usuario_id)
      .subscribe((usuarioExistente) => {
        if (!usuarioExistente) return;

        const usuarioSeleccionado = this.usuarios.find(
          (u) => u.id === this.usuario_id,
        );
        if (usuarioSeleccionado) {
          this.ventaForm.patchValue({ usuario: usuarioSeleccionado });
        }
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

  filteredProductos(): Producto[] {
    let filtered = this.productos.filter(
      (producto) => producto.estado_equipo !== false,
    );

    if (this.searchCategoria) {
      filtered = filtered.filter((producto) =>
        producto.categoria.nombre_categoria
          .toLowerCase()
          .includes(this.searchCategoria.toLowerCase()),
      );
    }

    if (this.searchNombreProducto) {
      filtered = filtered.filter((producto) =>
        producto.nombre_producto
          .toLowerCase()
          .includes(this.searchNombreProducto.toLowerCase()),
      );
    }

    if (this.searchCodigoProducto) {
      filtered = filtered.filter((producto) =>
        producto.codigo_producto
          .toLowerCase()
          .includes(this.searchCodigoProducto.toLowerCase()),
      );
    }

    return filtered.slice(
      (this.page - 1) * this.pageSize,
      this.page * this.pageSize,
    );
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

  nextPage() {
    this.page++;
  }

  previousPage() {
    if (this.page > 1) this.page--;
  }

  clearQuantities() {
    this.cantidadPorProducto = {};
    this.searchCategoria = '';
    this.searchNombreProducto = '';
    this.searchCodigoProducto = '';
    this.searchPrecio = '';
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
    if (!(this.ventaForm.valid && this.detalleVenta.length > 0)) return;

    const { usuario, estado } = this.ventaForm.value;

    const nuevaVenta: Venta = {
      id: 0,
      usuario: { ...usuario },
      estado,
      total: this.totalVenta,
      fecha_venta: new Date(),
    };

    this.productoService.crearVenta(nuevaVenta).subscribe(
      (response) => {
        this.idVentaActual = response.id;
        this.registrarDetallesVenta();
      },
      (error) => {
        console.error('Error al registrar la venta:', error);
        this.error = 'Error al registrar la venta.';
      },
    );
  }

  registrarDetallesVenta() {
    if (this.detalleVenta.length === 0) {
      this.error = 'No hay detalles de venta para registrar.';
      return;
    }

    if (this.idVentaActual === null) {
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

        // ✅ AHORA SÍ actualiza correctamente
        this.getProductos();

        // Reset
        this.detalleVenta = [];
        this.totalVenta = 0;
        this.idVentaActual = null;
        this.montoPagado = '';
        this.cambio = 0;

        this.ok = 'Venta registrada correctamente.';
      },
      error: (error) => {
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

  generarMensaje(): string {
    let mensaje = '📝 *Detalles de Venta:* 🗒\n\n';

    this.detalleVenta.forEach((item) => {
      const precio = item.precio != null ? item.precio : 0;
      const subtotal = item.subtotal != null ? item.subtotal : 0;

      mensaje += `🔷 Código: ${item.producto.codigo_producto}\n`;
      mensaje += `   Producto: ${item.producto.nombre_producto}\n`;
      mensaje += `   Cantidad: ${item.cantidad}\n`;
      mensaje += `   Precio: Bs ${precio.toFixed(2)}\n`;
      mensaje += `   Tipo de Venta: ${item.tipo_venta}\n`;
      mensaje += `   Subtotal: Bs ${subtotal.toFixed(2)}\n\n`;
    });

    mensaje += `💵 *Total:* Bs ${this.totalVenta.toFixed(2)}\n`;
    mensaje += `\n✅ ¡Gracias por tu compra! 😊`;

    return mensaje;
  }

  enviarPorWhatsApp() {
    if (!this.numeroTelefono) {
      this.error = 'Por favor ingresa un número de teléfono.';
      return;
    }
    if (this.detalleVenta.length === 0) {
      this.error = 'No hay productos en el carrito para enviar.';
      return;
    }

    const mensaje = this.generarMensaje();
    const mensajeCodificado = encodeURIComponent(mensaje);
    const telefono = String(this.numeroTelefono).replace(/\D/g, '');

    const url = `https://wa.me/${telefono}?text=${mensajeCodificado}`;
    window.open(url, '_blank');
  }

  toggleDetalles(index: number): void {
    this.detallesAbiertos[index] = !this.detallesAbiertos[index];
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  manejarOk() {
    this.ok = '';
  }

  manejarError() {
    this.error = '';
  }
}
