import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Categoria,
  DetalleVenta,
  Efectivo,
  Permiso,
  Producto,
  Role,
  RolePermiso,
  Sucursales,
  Usuario,
  UsuarioRol,
  Venta,
} from '../Models/models';

import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

// Define una interfaz para la respuesta del login
interface LoginResponse {
  access_token: string;
  roles: string[];
  permisos: string[];
  nombre_usuario: string; // Agregar esta línea
  apellido: string; // Agregar esta línea
  imagen_url: string; // Agregar esta línea
  usuario_id: number; // Agregar esta línea

    sucursal_id: number;
  sucursal_nombre: string;
}

@Injectable({
  providedIn: 'root',
})
export class ServicesService {
/* private apiUrl = 'http://localhost:8000/api/'; */
  private apiUrl = 'https://backendfreemarket-jecd.onrender.com/api/';

  
  private productosSubject = new BehaviorSubject<Producto[]>([]);
  productos$ = this.productosSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    if (typeof window !== 'undefined') {
      this.windowWidthSubject.next(window.innerWidth);
      window.addEventListener('resize', () => {
        this.windowWidthSubject.next(window.innerWidth);
      });
    }
  }
  login(correo: string, password: string): Observable<LoginResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { correo, password };

    return this.http
      .post<LoginResponse>(`${this.apiUrl}login/`, body, { headers })
      .pipe(
        tap((response) => {
          console.log(response);

          if (response.access_token) {
            localStorage.setItem('token', response.access_token);
            localStorage.setItem('roles', JSON.stringify(response.roles));
            localStorage.setItem('permisos', JSON.stringify(response.permisos));
            localStorage.setItem(
              'usuario',
              JSON.stringify({
                nombre_usuario: response.nombre_usuario,
                apellido: response.apellido,
                imagen_url: response.imagen_url,
                usuario_id: response.usuario_id,
                rol: response.roles[0],

                // NUEVO
                sucursal_id: response.sucursal_id,
                sucursal_nombre: response.sucursal_nombre,
              }),
            );
          }
        }),
      );
  }

  getSucursalLocalStorage() {
    const usuario = localStorage.getItem('usuario');
    if (!usuario) {
      return null;
    }

    const data = JSON.parse(usuario);

    return {
      id: data.sucursal_id,
      nombre: data.sucursal_nombre,
    };
  }
  getRolesFromLocalStorage(): string[] {
    const roles = localStorage.getItem('roles');
    return roles ? JSON.parse(roles) : [];
  }
  private getUserFromLocalStorage(): Usuario | null {
    const user = localStorage.getItem('usuario');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return localStorage.getItem('token') !== null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('usuario_id');
    this.router.navigate(['/login']);
  }

  getUsuarioLocalStorage() {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  }

  private windowWidthSubject = new BehaviorSubject<number>(0);
  windowWidth$ = this.windowWidthSubject.asObservable();

  /* ---------------------------- usuario ---------------------------- */
  getUsuarios(): Observable<Usuario[]> {
    const cacheKey = 'usuarios_list';
    const cached = typeof window !== 'undefined' ? window.sessionStorage.getItem(cacheKey) : null;

    if (cached) {
      try {
        const parsed = JSON.parse(cached) as Usuario[];
        return new Observable<Usuario[]>((observer) => {
          observer.next(parsed);
          observer.complete();
        });
      } catch {
        // ignorar
      }
    }

    return this.http.get<Usuario[]>(`${this.apiUrl}usuarios/`).pipe(
      tap((usuarios) => {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(cacheKey, JSON.stringify(usuarios));
        }
      }),
    );
  }
  getUserById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}usuarios/${id}/`);
  }
  registrarUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}usuarios/`, usuario);
  }
  editarUsuario(id: number, usuario: FormData): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}usuarios/${id}/`, usuario);
  }
  actualizarEstadoUsuario(
    id: number,
    estado_Usuario: boolean,
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}usuarios/${id}/`, {
      estado_Usuario: estado_Usuario ? 'true' : 'false',
    });
  }
  
  // Cambia el nombre de editarUsuario a actualizarUsuario
  actualizarUsuario(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}usuarios/${id}/`, usuario);
  }

  getRoles(): Observable<Role[]> {
    const cacheKey = 'roles_list';
    const cached = typeof window !== 'undefined' ? window.sessionStorage.getItem(cacheKey) : null;

    if (cached) {
      try {
        const parsed = JSON.parse(cached) as Role[];
        return new Observable<Role[]>((observer) => {
          observer.next(parsed);
          observer.complete();
        });
      } catch {
        // ignorar
      }
    }

    return this.http.get<Role[]>(`${this.apiUrl}roles/`).pipe(
      tap((roles) => {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(cacheKey, JSON.stringify(roles));
        }
      }),
    );
  }
  // Obtener un rol por ID
  getRolesById(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}roles/${id}/`);
  }

  registrarRoles(roles: Role): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}roles/`, roles);
  }
  editarRoles(id: number, roles: Role): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}roles/${id}/`, roles);
  }
  actualizarEstadoRol(id: number, estado_Rol: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}roles/${id}/`, {
      estado_Rol: estado_Rol ? 'true' : 'false',
    });
  }
  /* ---------------------------- permisos ---------------------------- */

  getPermisos(): Observable<Permiso[]> {
    const cacheKey = 'permisos_list';
    const cached = typeof window !== 'undefined' ? window.sessionStorage.getItem(cacheKey) : null;

    if (cached) {
      try {
        const parsed = JSON.parse(cached) as Permiso[];
        return new Observable<Permiso[]>((observer) => {
          observer.next(parsed);
          observer.complete();
        });
      } catch {
        // ignorar
      }
    }

    return this.http.get<Permiso[]>(`${this.apiUrl}permisos/`).pipe(
      tap((permisos) => {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(cacheKey, JSON.stringify(permisos));
        }
      }),
    );
  }
  // Obtener un rol por ID
  getPermisosById(id: number): Observable<Permiso> {
    return this.http.get<Permiso>(`${this.apiUrl}permisos/${id}/`);
  }

  registrarPermisos(permisos: Permiso): Observable<Permiso> {
    return this.http.post<Permiso>(`${this.apiUrl}permisos/`, permisos);
  }
  editarPermisos(id: number, permisos: Permiso): Observable<Permiso> {
    return this.http.put<Permiso>(`${this.apiUrl}permisos/${id}/`, permisos);
  }
  actualizarEstadoPermisos(
    id: number,
    estado_Permiso: boolean,
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}permisos/${id}/`, {
      estado_Permiso: estado_Permiso ? 'true' : 'false',
    });
  }
   /* ---------------------------- Sucursales ---------------------------- */

    getSucursales(): Observable<Sucursales[]> {
      return this.http.get<Sucursales[]>(`${this.apiUrl}sucursales/`);
    }
    
    // Obtener una sucursal por ID
    getSucursalesById(id: number): Observable<Sucursales> {
      return this.http.get<Sucursales>(`${this.apiUrl}sucursales/${id}/`);
    }

    registrarSucursales(sucursales: Sucursales): Observable<Sucursales> {
      return this.http.post<Sucursales>(`${this.apiUrl}sucursales/`, sucursales);
    }
    editarSucursales(id: number, sucursales: Sucursales): Observable<Sucursales> {
      return this.http.put<Sucursales>(`${this.apiUrl}sucursales/${id}/`, sucursales);
    }
    actualizarEstadoSucursales(
      id: number,
      estado_Sucursal: boolean,
    ): Observable<any> {
      return this.http.put(`${this.apiUrl}sucursales/${id}/`, {
        estado_Sucursal: estado_Sucursal ? 'true' : 'false',
      });
    }


  /* ---------------------------- UsuarioRol ---------------------------- */

  getUsuariosRoles(): Observable<UsuarioRol[]> {
    const cacheKey = 'usuarios_roles_list';
    const cached = typeof window !== 'undefined' ? window.sessionStorage.getItem(cacheKey) : null;

    if (cached) {
      try {
        const parsed = JSON.parse(cached) as UsuarioRol[];
        return new Observable<UsuarioRol[]>((observer) => {
          observer.next(parsed);
          observer.complete();
        });
      } catch {
        // ignorar
      }
    }

    return this.http.get<UsuarioRol[]>(`${this.apiUrl}usuariosroles/`).pipe(
      tap((usuariosRoles) => {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(cacheKey, JSON.stringify(usuariosRoles));
        }
      }),
    );
  }

  getUsuarioRolById(id: number): Observable<UsuarioRol> {
    return this.http.get<UsuarioRol>(`${this.apiUrl}usuariosroles/${id}/`);
  }

  registrarUsuarioRol(usuarioRol: UsuarioRol): Observable<UsuarioRol> {
    return this.http.post<UsuarioRol>(
      `${this.apiUrl}usuariosroles/`,
      usuarioRol,
    );
  }

  editarUsuarioRol(id: number, usuarioRol: UsuarioRol): Observable<UsuarioRol> {
    return this.http.put<UsuarioRol>(
      `${this.apiUrl}usuariosroles/${id}/`,
      usuarioRol,
    );
  }

  /* ---------------------------- RolePermiso ---------------------------- */

  getRolesPermisos(): Observable<RolePermiso[]> {
    const cacheKey = 'roles_permisos_list';
    const cached = typeof window !== 'undefined' ? window.sessionStorage.getItem(cacheKey) : null;

    if (cached) {
      try {
        const parsed = JSON.parse(cached) as RolePermiso[];
        return new Observable<RolePermiso[]>((observer) => {
          observer.next(parsed);
          observer.complete();
        });
      } catch {
        // ignorar
      }
    }

    return this.http.get<RolePermiso[]>(`${this.apiUrl}rolespermisos/`).pipe(
      tap((rolesPermisos) => {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(cacheKey, JSON.stringify(rolesPermisos));
        }
      }),
    );
  }

  getRolePermisoById(id: number): Observable<RolePermiso> {
    return this.http.get<RolePermiso>(`${this.apiUrl}rolespermisos/${id}/`);
  }

  registrarRolePermiso(rolePermiso: RolePermiso): Observable<RolePermiso> {
    return this.http.post<RolePermiso>(
      `${this.apiUrl}rolespermisos/`,
      rolePermiso,
    );
  }

  editarRolePermiso(
    id: number,
    rolePermiso: RolePermiso,
  ): Observable<RolePermiso> {
    return this.http.put<RolePermiso>(
      `${this.apiUrl}rolespermisos/${id}/`,
      rolePermiso,
    );
  }

  /* ---------------------------- CATEGORÍAS ---------------------------- */

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}categorias/`);
  }
  getCategoriaById(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}categorias/${id}/`);
  }
  crearCategoria(categoria: Categoria): Observable<Categoria> {
    return this.http.post<Categoria>(`${this.apiUrl}categorias/`, categoria);
  }
  actualizarCategoria(id: number, categoria: Categoria): Observable<Categoria> {
    return this.http.put<Categoria>(
      `${this.apiUrl}categorias/${id}/`,
      categoria,
    );
  }
  actualizarEstadoCategoria(
    id: number,
    estado_categoria: boolean,
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}categorias/${id}/`, {
      estado_categoria: estado_categoria ? 'true' : 'false',
    });
  }
  /* ---------------------------- PRODUCTOS ---------------------------- */
  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}productos/`);
  }

  getProductoById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}productos/${id}/`);
  }

  crearProducto(formData: FormData): Observable<Producto> {
    return this.http.post<Producto>(`${this.apiUrl}productos/`,formData);
  }
  

  actualizarProducto(
    id: number,
    formData: FormData
  ): Observable<Producto> {
    return this.http.put<Producto>(
      `${this.apiUrl}productos/${id}/`,
      formData
    );
  }
  actualizarEstadoProducto(id: number,estado_equipo: boolean,): Observable<any> {
    return this.http.put(`${this.apiUrl}productos/${id}/`, {
      estado_equipo: estado_equipo ? 'true' : 'false',
    });
  }
  getProductosPorSucursal(
    sucursalId: number
  ): Observable<Producto[]> {
    return this.http.get<Producto[]>(
      `${this.apiUrl}productos/sucursal/${sucursalId}/`
    );
  }
  /* ---------------------------- VENTAS ---------------------------- */

  getVentas(): Observable<Venta[]> {
    return this.http.get<Venta[]>(`${this.apiUrl}ventas/`);
  }
  getVentaById(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.apiUrl}ventas/${id}/`);
  }
  crearVenta(venta: Venta): Observable<Venta> {
    return this.http.post<Venta>(`${this.apiUrl}ventas/`, venta);
  }
  actualizarVenta(id: number, venta: Venta): Observable<Venta> {
    return this.http.put<Venta>(`${this.apiUrl}ventas/${id}/`, venta);
  }
  getVentasPorSucursal(
    sucursalId: number
  ): Observable<Venta[]> {
    const cacheKey = `ventas_sucursal_${sucursalId}`;
    let cachedVentas: Venta[] | null = null;

    if (typeof window !== 'undefined') {
      const cachedValue = window.sessionStorage.getItem(cacheKey);
      if (cachedValue) {
        try {
          cachedVentas = JSON.parse(cachedValue) as Venta[];
        } catch {
          cachedVentas = null;
        }
      }
    }

    return new Observable<Venta[]>((observer) => {
      if (cachedVentas) {
        observer.next(cachedVentas);
      }

      this.http.get<Venta[]>(`${this.apiUrl}ventas/sucursal/${sucursalId}/`).subscribe({
        next: (ventas) => {
          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem(cacheKey, JSON.stringify(ventas));
          }
          observer.next(ventas);
          observer.complete();
        },
        error: (error) => observer.error(error),
      });
    });
  }
  /* ---------------------------- DETALLES DE VENTAS ---------------------------- */
  getDetalleVentas(): Observable<DetalleVenta[]> {
    const sucursal = this.getSucursalLocalStorage();
    const sucursalId = sucursal?.id;

    if (!sucursalId) {
      return new Observable<DetalleVenta[]>((observer) => {
        observer.next([]);
        observer.complete();
      });
    }

    const cacheKey = `detalles_ventas_sucursal_${sucursalId}`;
    let cachedDetalles: DetalleVenta[] | null = null;

    if (typeof window !== 'undefined') {
      const cachedValue = window.sessionStorage.getItem(cacheKey);
      if (cachedValue) {
        try {
          cachedDetalles = JSON.parse(cachedValue) as DetalleVenta[];
        } catch {
          cachedDetalles = null;
        }
      }
    }

    return new Observable<DetalleVenta[]>((observer) => {
      if (cachedDetalles) {
        observer.next(cachedDetalles);
      }

      this.http.get<DetalleVenta[]>(`${this.apiUrl}detallesventas/sucursal/${sucursalId}/`).subscribe({
        next: (detalles) => {
          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem(cacheKey, JSON.stringify(detalles));
          }
          observer.next(detalles);
          observer.complete();
        },
        error: (error) => observer.error(error),
      });
    });
  }

  getDetalleVentaById(id: number): Observable<DetalleVenta> {
    return this.http.get<DetalleVenta>(`${this.apiUrl}detallesventas/${id}/`);
  }

  crearDetalleVenta(data: any): Observable<any> {
    // Cambia a 'any'
    return this.http.post(`${this.apiUrl}detallesventas/`, data);
  }

  actualizarDetalleVenta(
    id: number,
    detallesVenta: DetalleVenta,
  ): Observable<DetalleVenta> {
    return this.http.put<DetalleVenta>(
      `${this.apiUrl}detallesventas/${id}/`,
      detallesVenta,
    );
  }

  /* SECCION DE VENTAS  Y DE TALLE VENTAS  */
  verificarUsuario(usuario_id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}usuarios/${usuario_id}`);
  }
  registrarVenta(ventaData: any): Observable<Venta> {
    const usuario = this.getUserFromLocalStorage(); // Obtener los datos del usuario desde localStorage
    if (usuario) {
      const ventaConUsuario = {
        ...ventaData,
        usuario: usuario.id,
      };

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getToken()}`, // Aquí aseguramos el envío del token
      });

      return this.http.post<Venta>(`${this.apiUrl}ventas/`, ventaConUsuario, {
        headers,
      });
    } else {
      throw new Error('Usuario no autenticado');
    }
  }
  /* SECCION DE TARJETAS */

  isAdmin(): boolean {
    const roles = this.getRolesFromLocalStorage();
    return roles.includes('Administrador');
  }
  isAdministracionYucumo(): boolean {
    const roles = this.getRolesFromLocalStorage();
    return roles.includes('AdministraciónYucumo');
  }

  actualizarEstadoRecargaProducto(
    id: number,
    estado: boolean,
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}RecargaProducto/${id}/`, {
      estado: estado ? 'true' : 'false',
    });
  }

  /* ---------------------------- SERVICIOS DE EFECTIVO ---------------------------- */

  getEfectivos(): Observable<Efectivo[]> {
    return this.http.get<Efectivo[]>(`${this.apiUrl}efectivo/`);
  }

  getEfectivoById(id: number): Observable<Efectivo> {
    return this.http.get<Efectivo>(`${this.apiUrl}efectivo/${id}/`);
  }

  crearEfectivo(efectivo: Efectivo): Observable<Efectivo> {
    return this.http.post<Efectivo>(`${this.apiUrl}efectivo/`, efectivo);
  }

  actualizarEfectivo(id: number, efectivo: Efectivo): Observable<Efectivo> {
    return this.http.put<Efectivo>(`${this.apiUrl}efectivo/${id}/`, efectivo);
  }
}
