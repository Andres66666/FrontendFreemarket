import { Routes } from '@angular/router';
import { DashboardComponent } from './components/Dashboard/dashboard.component';
import { EditarPermisoComponent } from './components/GestionUsuarios/Permisos/editar-permiso/editar-permiso.component';
import { ListarPermisoComponent } from './components/GestionUsuarios/Permisos/listar-permiso/listar-permiso.component';
import { RegistrarPermisoComponent } from './components/GestionUsuarios/Permisos/registrar-permiso/registrar-permiso.component';
import { EditarRolComponent } from './components/GestionUsuarios/Roles/editar-rol/editar-rol.component';
import { ListarRolComponent } from './components/GestionUsuarios/Roles/listar-rol/listar-rol.component';
import { RegistrarRolComponent } from './components/GestionUsuarios/Roles/registrar-rol/registrar-rol.component';
import { EditarRolPermisoComponent } from './components/GestionUsuarios/RolesPermisos/editar-rol-permiso/editar-rol-permiso.component';
import { ListarRolPermisoComponent } from './components/GestionUsuarios/RolesPermisos/listar-rol-permiso/listar-rol-permiso.component';
import { RegistrarRolPermisoComponent } from './components/GestionUsuarios/RolesPermisos/registrar-rol-permiso/registrar-rol-permiso.component';
import { EditarUsuarioComponent } from './components/GestionUsuarios/Usuarios/editar-usuario/editar-usuario.component';
import { ListarUsuarioComponent } from './components/GestionUsuarios/Usuarios/listar-usuario/listar-usuario.component';
import { PerfilComponent } from './components/GestionUsuarios/Usuarios/perfil/perfil.component';
import { RegistrarUsuarioComponent } from './components/GestionUsuarios/Usuarios/registrar-usuario/registrar-usuario.component';
import { EditarUsuarioRolComponent } from './components/GestionUsuarios/UsuariosRoles/editar-usuario-rol/editar-usuario-rol.component';
import { ListarUsuarioRolComponent } from './components/GestionUsuarios/UsuariosRoles/listar-usuario-rol/listar-usuario-rol.component';
import { RegistrarUsuarioRolComponent } from './components/GestionUsuarios/UsuariosRoles/registrar-usuario-rol/registrar-usuario-rol.component';
import { EditarCategoriaComponent } from './components/GestiosProductos/Categorias/editar-categoria/editar-categoria.component';
import { ListarCategoriaComponent } from './components/GestiosProductos/Categorias/listar-categoria/listar-categoria.component';
import { RegistrarCategoriaComponent } from './components/GestiosProductos/Categorias/registrar-categoria/registrar-categoria.component';
import { ListarDetalleVentaComponent } from './components/GestiosProductos/DetalleVentas/listar-detalle-venta.component';
import { EfectivoComponent } from './components/GestiosProductos/efectivo/efectivo.component';
import { PrestamosComponent } from './components/GestiosProductos/prestamos/prestamos.component';
import { EditarProductoComponent } from './components/GestiosProductos/Productos/editar-producto/editar-producto.component';
import { ListarProductoComponent } from './components/GestiosProductos/Productos/listar-producto/listar-producto.component';
import { ListarProductosEmpleadoComponent } from './components/GestiosProductos/Productos/listar-productos-empleado/listar-productos-empleado.component';
import { RegistrarProductoComponent } from './components/GestiosProductos/Productos/registrar-producto/registrar-producto.component';
import { ListarVentaComponent } from './components/GestiosProductos/Ventas/listar-venta/listar-venta.component';
import { IndexComponent } from './components/Index/index.component';
import { LoginComponent } from './components/Login/login.component';
import { PanelControlComponent } from './components/PanelControl/panel-control.component';
import { authGuard } from './guards/auth.guard';
import { Registrar } from './components/GestiosProductos/sucursales/registrar/registrar';
import { Editar } from './components/GestiosProductos/sucursales/editar/editar';
import { Listar } from './components/GestiosProductos/sucursales/listar/listar';

/* ================= CREDITOS ================= */
import { ListarCreditos } from './components/MovilCreditos/listar-creditos/listar-creditos';
import { RegistrarCredito } from './components/MovilCreditos/registrar-credito/registrar-credito';
import { DetalleCredito } from './components/MovilCreditos/detalle-credito/detalle-credito';

export const routes: Routes = [
  { path: '', component: IndexComponent },
  { path: 'index', component: IndexComponent },
  { path: 'login', component: LoginComponent },

  {
    path: 'panel-control',
    component: PanelControlComponent,
    canActivate: [authGuard], // Agregado: Protege toda la ruta del panel
    children: [
      /* ================= USUARIOS ================= */
      { path: 'registrar-usuarios', component: RegistrarUsuarioComponent },
      { path: 'editar-usuarios/:id', component: EditarUsuarioComponent },
      { path: 'listar-usuarios', component: ListarUsuarioComponent },

      /* ================= ROLES ================= */
      { path: 'registrar-roles', component: RegistrarRolComponent },
      { path: 'editar-roles/:id', component: EditarRolComponent },
      { path: 'listar-roles', component: ListarRolComponent },

      /* ================= PERMISOS ================= */
      { path: 'registrar-permisos', component: RegistrarPermisoComponent },
      { path: 'editar-permisos/:id', component: EditarPermisoComponent },
      { path: 'listar-permisos', component: ListarPermisoComponent },

      /* ========== USUARIO - ROLES ========== */
      {
        path: 'registrar-usuarios-roles',
        component: RegistrarUsuarioRolComponent,
      },
      {
        path: 'editar-usuarios-roles/:id',
        component: EditarUsuarioRolComponent,
      },
      { path: 'listar-usuarios-roles', component: ListarUsuarioRolComponent },

      /* ========== ROLES - PERMISOS ========== */
      {
        path: 'registrar-roles-permisos',
        component: RegistrarRolPermisoComponent,
      },
      {
        path: 'editar-roles-permisos/:id',
        component: EditarRolPermisoComponent,
      },
      { path: 'listar-roles-permisos', component: ListarRolPermisoComponent },

      /* ================= CATEGORÍAS ================= */
      { path: 'registrar-categorias', component: RegistrarCategoriaComponent },
      { path: 'editar-categorias/:id', component: EditarCategoriaComponent },
      { path: 'listar-categorias', component: ListarCategoriaComponent },

      /* ================= PRODUCTOS ================= */
      { path: 'registrar-productos', component: RegistrarProductoComponent },
      { path: 'editar-productos/:id', component: EditarProductoComponent },
      { path: 'listar-productos', component: ListarProductoComponent },
      {
        path: 'listar-productos-empleado',
        component: ListarProductosEmpleadoComponent,
      },

      /* ================= VENTAS ================= */
      { path: 'listar-ventas', component: ListarVentaComponent },
      { path: 'listar-detalle-ventas', component: ListarDetalleVentaComponent },

      { path: 'efectivo', component: EfectivoComponent },

      /* ================= DASHBOARD / PERFIL ================= */
      { path: 'dashboardComponent', component: DashboardComponent },
      { path: 'perfil', component: PerfilComponent },

      /* ================= TARJETAS ================= */
      { path: 'prestamo', component: PrestamosComponent },

      
      /* ================= Sucursales  ================= */
      { path: 'registrar-sucursales', component: Registrar },
      { path: 'editar-sucursales/:id', component: Editar },
      { path: 'listar-sucursales', component: Listar },

      /* ================= CREDITOS ================= */
      {
        path: 'listar-creditos',
        component: ListarCreditos,
      },
      {
        path: 'registrar-credito',
        component: RegistrarCredito,
      },
      {
        path: 'detalle-credito/:id',
        component: DetalleCredito,
      },
      /* ================= DEFAULT ================= */
      { path: '', component: DashboardComponent }, // Cambiado: Usa DashboardComponent como default (asegúrate de que exista)
    ],
  },
];
