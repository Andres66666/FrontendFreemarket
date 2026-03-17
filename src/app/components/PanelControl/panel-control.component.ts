import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  HostListener,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { StorageService } from '../../Services/Storage.service';
import { ServicesService } from '../../Services/services.service';

type UsuarioLS = {
  nombre_usuario?: string;
  apellido?: string;
  imagen_url?: string | null;
  usuario_id?: number;
};

@Component({
  selector: 'app-panel-control',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './panel-control.component.html',
  styleUrls: ['./panel-control.component.css'],
})
export class PanelControlComponent implements OnInit {
  isSidebarOpen = false;
  windowWidth = 0;

  userName = '';
  userPermissions: string[] = [];
  roles: string[] = [];

  nombre_usuario = '';
  apellido = '';
  imagen_url: string | null = null;
  usuario_id = 0;

  openSubmenu: string | null = null;
  isSidebarCollapsed = false;
  constructor(
    private storageService: StorageService,
    private router: Router,
    private authService: ServicesService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    this.loadSessionFromStorage();
    this.checkScreenSize();
  }

  private safeParse<T>(raw: string | null, fallback: T): T {
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  private loadSessionFromStorage(): void {
    const usuarioStr = this.storageService.getItem('usuario');
    const datosUsuario = this.safeParse<UsuarioLS>(usuarioStr, {});

    // Roles / Permisos 74707215
    this.roles = this.safeParse<string[]>(localStorage.getItem('roles'), []);
    this.userPermissions = this.safeParse<string[]>(
      localStorage.getItem('permisos'),
      [],
    );

    // Campos
    this.nombre_usuario = datosUsuario.nombre_usuario ?? '';
    this.apellido = datosUsuario.apellido ?? '';
    this.userName = `${this.nombre_usuario} ${this.apellido}`.trim();

    this.imagen_url = datosUsuario.imagen_url ?? null;
    this.usuario_id = datosUsuario.usuario_id ?? 0;
  }

  // ===== Permisos / Roles =====
  puedeVer(permiso: string | string[]): boolean {
    if (!this.userPermissions?.length) return false;
    return Array.isArray(permiso)
      ? permiso.some((p) => this.userPermissions.includes(p))
      : this.userPermissions.includes(permiso);
  }

  tieneRol(rol: string): boolean {
    if (!this.roles?.length) return false;

    // Por si a veces roles viene como "Administrador" / "Empleado" y otras como "ROLE_ADMIN"
    return this.roles.some(
      (r) => String(r).toLowerCase() === rol.toLowerCase(),
    );
  }

  // ===== Sidebar =====
  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.windowWidth = window.innerWidth;
    this.isSidebarOpen = this.windowWidth >= 768;
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;

    if (this.isSidebarOpen) {
      this.isSidebarCollapsed = false;
    }
  }
  toggleSubmenu(menu: string): void {
    if (this.isSidebarCollapsed) {
      this.isSidebarCollapsed = false;
      this.openSubmenu = menu;
      return;
    }
    this.openSubmenu = this.openSubmenu === menu ? null : menu;
  }
  isSubmenuOpen(menu: string): boolean {
    return this.openSubmenu === menu;
  }

  // ===== Sesión =====
  logout(): void {
    this.storageService.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('roles');
    localStorage.removeItem('permisos');
    this.router.navigate(['/index']);
  }

  confirmarCerrarSesion(): void {
    if (confirm('¿Está seguro de que desea cerrar sesión?')) this.logout();
  }

  verPerfil(): void {
    this.router.navigate(['panel-control/perfil']);
  }

  panelDeControl(): void {
    this.router.navigate(['panel-control/dashboardComponent']);
  }
  collapseSidebar(): void {
    if (this.windowWidth >= 768) {
      this.isSidebarCollapsed = true;
    } else {
      this.isSidebarOpen = false;
    }
  }
}
