import { ServicesService } from '../../../../Services/services.service';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Sucursales, Usuario } from '../../../../Models/models';

@Component({
  selector: 'app-listar-usuario',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './listar-usuario.component.html',
  styleUrl: './listar-usuario.component.css',
})
export class ListarUsuarioComponent implements OnInit {
  usuarios: Usuario[] = [];
  //variables para las busquedas
  searchnombreUsuario: string = ''; // Nuevo campo para el nombre
  searchcorreo: string = ''; // Nuevo campo para el modelo
  searchci: string = ''; // Nuevo campo para la marca
  searchdepartamento: string = ''; // Nuevo campo para la marca

  sucursal: Sucursales | null = null;
  
  constructor(private servicesService: ServicesService,private router: Router,) {}

  ngOnInit(): void {
    this.getUsuarios();
  }
  getUsuarios() {
    this.servicesService.getUsuarios().subscribe((data) => {
      console.log(data);
      this.usuarios = data;
      this.ordenarUsuariosPorId();
    });
  }
  
  getSucursalById(id: number) {
    this.servicesService.getSucursalesById(id).subscribe(
      (data) => {
        this.sucursal = data;
      },
      (error) => {
        console.error('Error al obtener la sucursal:', error);
      }
    );
  }
  editarUsuario(id: number) {
    this.router.navigate(['panel-control/editar-usuarios', id]);
  }
  registrarUsuario() {
    this.router.navigate(['panel-control/registrar-usuarios']);
  }
  filteredUsuarios(): Usuario[] {
    let filtered = this.usuarios;

    // Filtrado basado en los tres campos
    if (this.searchnombreUsuario) {
      filtered = filtered.filter((usuario) =>
        (usuario.nombre_usuario + '' + usuario.apellido)

          .toLowerCase()
          .includes(this.searchnombreUsuario.toLowerCase())
      );
    }
    if (this.searchcorreo) {
      filtered = filtered.filter((usuario) =>
        usuario.correo?.toLowerCase().includes(this.searchcorreo.toLowerCase())
      );
    }
    if (this.searchci) {
      filtered = filtered.filter((usuario) =>
        usuario.ci.toLowerCase().includes(this.searchci.toLowerCase())
      );
    }
    if (this.searchdepartamento) {
      filtered = filtered.filter((usuario) =>
        usuario.ci_departamento
          .toLowerCase()
          .includes(this.searchdepartamento.toLowerCase())
      );
    }

    return filtered
  }
  
  toggleUsuarioActivo(usuario: any) {
    usuario.estado_Usuario = !usuario.estado_Usuario; 
    this.servicesService
      .actualizarEstadoUsuario(usuario.id, usuario.estado_Usuario) 
      .subscribe(
        (response) => {
          console.log(
            `Usuario ${usuario.nombre_usuario} actualizado exitosamente.`
          );
        },
        (error) => {
          console.error('Error al actualizar el estado del usuario:', error);
        }
      );
  }
  ordenarUsuariosPorId() {
    this.usuarios.sort((a, b) => a.id - b.id); // Ordenar por ID en orden ascendente
  }
}
