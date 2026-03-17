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

export interface Usuario {
  id: number;
  nombre_usuario: string;
  apellido: string;
  fecha_nacimiento: Date;
  telefono: string;
  correo: string;
  password: string;
  ci: string;
  ci_departamento: string;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  estado_Usuario: boolean;
  imagen_url: string;
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
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  imagen_productos: string;
  estado_equipo: boolean;
}

export interface Venta {
  id: number;
  fecha_venta: Date;
  usuario: Usuario;
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
