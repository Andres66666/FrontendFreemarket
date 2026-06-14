import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Role } from '../../../../Models/models';
import { ServicesService } from '../../../../Services/services.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-listar-rol',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './listar-rol.component.html',
  styleUrls: ['./listar-rol.component.css'],
})
export class ListarRolComponent implements OnInit {
  roles: Role[] = [];

  searchNombreRol: string = '';
  

  constructor(
    private servicesService: ServicesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getRoles();
  }

  getRoles(): void {
    this.servicesService.getRoles().subscribe((data) => {
      this.roles = data;

    });
  }

  /* 🔹 MISMA LÓGICA QUE TU EJEMPLO BUENO */
  editarRol(id: number): void {
    this.router.navigate(['panel-control/editar-roles', id]);
  }

  registrarRol(): void {
    this.router.navigate(['panel-control/registrar-roles']);
  }

  filteredRoles(): Role[] {
    let filtered = this.roles;

    if (this.searchNombreRol.trim()) {
      filtered = filtered.filter((rol) =>
        rol.nombre_rol
          .toLowerCase()
          .includes(this.searchNombreRol.toLowerCase())
      );
    }

    return filtered
  }


  toggleRolActivo(rol: Role): void {
    const nuevoEstado = !rol.estado_Rol;

    this.servicesService
      .actualizarEstadoRol(rol.id, nuevoEstado)
      .subscribe({
        next: () => {
          rol.estado_Rol = nuevoEstado;
        },
        error: () => {
          console.error('Error al actualizar el estado del rol');
        },
      });
  }
}