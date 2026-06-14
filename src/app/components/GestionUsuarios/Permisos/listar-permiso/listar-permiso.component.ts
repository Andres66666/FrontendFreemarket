import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Permiso } from '../../../../Models/models';
import { ServicesService } from '../../../../Services/services.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listar-permiso',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './listar-permiso.component.html',
  styleUrl: './listar-permiso.component.css',
})
export class ListarPermisoComponent implements OnInit {
  permisos: Permiso[] = []; // Array para almacenar los permisos
  searchNombrePermiso: string = ''; // Campo de búsqueda para el nombre del permiso


  constructor(private servicesService: ServicesService, private router: Router) {}

  ngOnInit(): void {
    this.getPermisos(); 
  }

  getPermisos() {
    this.servicesService.getPermisos().subscribe((data) => {
      this.permisos = data; 
    });
  }

  editarPermiso(id: number) {
    this.router.navigate(['panel-control/editar-permisos', id]);
  }

  registrarPermiso() {
    this.router.navigate(['panel-control/registrar-permisos']); // Emit an event to register a new permission
  }

  filteredPermisos(): Permiso[] {
    let filtered = this.permisos;

    if (this.searchNombrePermiso) {
      filtered = this.permisos.filter((permiso) =>
        permiso.nombre_permiso
          .toLowerCase()
          .includes(this.searchNombrePermiso.toLowerCase())
      );
    }

    return filtered
  }

  togglePermisoActivo(permiso: Permiso) {
    permiso.estado_Permiso = !permiso.estado_Permiso; 
    this.servicesService
      .actualizarEstadoPermisos(permiso.id, permiso.estado_Permiso)
      .subscribe(
        (response) => {
          console.log(
            `Permiso ${permiso.nombre_permiso} actualizado exitosamente.`
          );
        },
        (error) => {
          console.error('Error al actualizar el estado del permiso:', error);
          permiso.estado_Permiso = !permiso.estado_Permiso; 
        }
      );
  }
}
