export interface Role {
  id: number;
  nombre_rol: string;
  estado_Rol: boolean;
}

export interface Permiso {
  id: number;
  nombre_permiso: string;
  descripcion: string;
  estado_Permiso: boolean;
}

export interface Sucursales {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  estado: boolean;
}

export interface Usuario {
  id: number;
  nombre_usuario: string;
  apellido: string;
  fecha_nacimiento: string;
  telefono: string;
  correo: string;
  password: string;
  ci: string;
  ci_departamento: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  estado_Usuario: boolean;
  imagen_url: string;
  sucursal: Sucursales;
}

export interface UsuarioRol {
  id: number;
  usuario: Usuario;
  rol: Role;
}

export interface RolePermiso {
  id: number;
  rol: Role;
  permiso: Permiso;
}

export interface Categoria {
  id: number;
  nombre_categoria: string;
  descripcion: string;
  estado_categoria: boolean;
}

export interface Producto {
  id: number;
  nombre_producto: string;
  descripcion: string;
  precio_compra: number;
  precio_unitario: number;
  precio_mayor: number;
  stock: number;
  codigo_producto: string;
  categoria: Categoria;
  imagen_productos: string;
  imagen_public_id: string;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  estado_equipo: boolean;
  sucursal: Sucursales;
}

export interface Venta {
  id: number;
  fecha_venta: Date;
  usuario: Usuario;
  sucursal: Sucursales;
  estado: string;
  total: number;
}

export interface DetalleVenta {
  id: number;
  venta: Venta;
  producto: Producto;
  cantidad: number;
  precio: number;
  subtotal: number;
  tipo_venta: string;
}

export interface Efectivo {
  id: number;
  B200Bs: number;
  B100Bs: number;
  B50Bs: number;
  B20Bs: number;
  B10Bs: number;
  M5Bs: number;
  M2Bs: number;
  M1: number;
  M0_50Bs: number;
  M0_20Bs: number;
  M0_10Bs: number;
  total: number;
  fecha_creacion: Date;
}

/* nueva seccion de creditos  */
export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  ci: string;
  telefono: string;
  descripcion: string;
}

export interface Credito {
  id: number;
  cliente: Cliente;
  producto: Producto;
  usuario: Usuario;
  fecha_credito: Date;
  precio_total: number;
  cantidad_cuotas: number;
  cuota_mensual: number;
  cuotas_pagadas: number;
  saldo_pendiente: number;
  estado: 'PENDIENTE' | 'PAGANDO' | 'PAGADO';
  stock_descontado: boolean;
}

export interface PagoCredito {
  id: number;
  credito: Credito;
  numero_cuota: number;
  monto_pagado: number;
  fecha_pago: Date;
  observacion: string;
}

export interface ReciboCredito {
  id: number;
  pago: PagoCredito;
  numero_recibo: string;
  fecha_emision: Date;
}