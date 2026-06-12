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
  // ==========================
  // SIDEBAR
  // ==========================

  windowWidth = 0;

  // ==========================
  // USUARIO
  // ==========================
  userName = '';
  userPermissions: string[] = [];
  roles: string[] = [];

  nombre_usuario = '';
  apellido = '';
  imagen_url: string | null = null;
  usuario_id = 0;

  isSidebarOpen = false; // Estado actual de la barra
  activeSection: string | null = null; // Sección activa (ej: 'usuarios')

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

  // ==========================
  // STORAGE
  // ==========================
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

    const datosUsuario =
      this.safeParse<UsuarioLS>(usuarioStr, {});

    this.roles = this.safeParse<string[]>(
      localStorage.getItem('roles'),
      [],
    );

    this.userPermissions = this.safeParse<string[]>(
      localStorage.getItem('permisos'),
      [],
    );

    this.nombre_usuario =
      datosUsuario.nombre_usuario ?? '';

    this.apellido =
      datosUsuario.apellido ?? '';

    this.userName =
      `${this.nombre_usuario} ${this.apellido}`.trim();

    this.imagen_url =
      datosUsuario.imagen_url ?? null;

    this.usuario_id =
      datosUsuario.usuario_id ?? 0;
  }

  // ==========================
  // ROLES / PERMISOS
  // ==========================
  puedeVer(permiso: string | string[]): boolean {
    if (!this.userPermissions?.length) {
      return false;
    }

    return Array.isArray(permiso)
      ? permiso.some((p) =>
          this.userPermissions.includes(p),
        )
      : this.userPermissions.includes(permiso);
  }

  tieneRol(rol: string): boolean {
    if (!this.roles?.length) {
      return false;
    }

    return this.roles.some(
      (r) =>
        String(r).toLowerCase() ===
        rol.toLowerCase(),
    );
  }

  // ==========================
  // RESPONSIVE
  // ==========================
  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.windowWidth = window.innerWidth;

    if (this.windowWidth >= 992) {
      this.isSidebarOpen = true;
    } else {
      this.isSidebarOpen = false;
    }
  }

  // ==========================
  // SIDEBAR
  // ==========================
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleSection(section: string) {
    if (this.activeSection === section) {
      this.activeSection = null;
    } else {
      this.activeSection = section;
    }
    
    if (!this.isSidebarOpen) {
      this.isSidebarOpen = true;
    }
  }

  isActive(section: string): boolean {
    return this.activeSection === section;
  }

  navegarYRegresar(ruta: string): void {
    this.router.navigate([ruta]);
    this.activeSection = null;
    if (this.windowWidth < 992) {
      this.isSidebarOpen = false;
    }
  }

  // ==========================
  // CLICK FUERA DEL SIDEBAR
  // ==========================
  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    const clickedInsideSidebar =
      target.closest('.leftSide');

    const clickedInsideToggleButton =
      target.closest('.toggle-button');

    if (
      !clickedInsideSidebar &&
      !clickedInsideToggleButton
    ) {

      // Cerrar submenu siempre
      this.activeSection = null;

      // En móvil cerrar sidebar completo
      if (this.windowWidth < 992) {
        this.isSidebarOpen = false;
      }
    }
  }
  onMainContentClick() {
    if (this.isSidebarOpen) {
      this.isSidebarOpen = false;
    }
  }
  // ==========================
  // NAVEGACIÓN
  // ==========================
  panelDeControl(): void {
    this.router.navigate([
      '/panel-control/dashboardComponent',
    ]);

    if (this.windowWidth < 992) {
      this.isSidebarOpen = false;
    }
  }

  verPerfil(): void {
    this.router.navigate([
      '/panel-control/perfil',
    ]);

    if (this.windowWidth < 992) {
      this.isSidebarOpen = false;
    }
  }

  // ==========================
  // SESIÓN
  // ==========================
  confirmarCerrarSesion(): void {
    const confirmar = confirm(
      '¿Está seguro de que desea cerrar sesión?',
    );

    if (confirmar) {
      this.logout();
    }
  }

  logout(): void {
    this.storageService.removeItem('token');

    localStorage.removeItem('usuario');
    localStorage.removeItem('roles');
    localStorage.removeItem('permisos');

    this.router.navigate(['/index']);
  }
}