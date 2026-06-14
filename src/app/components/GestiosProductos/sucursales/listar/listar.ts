import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ServicesService } from '../../../../Services/services.service';
import { Router } from '@angular/router';
import { Sucursales } from '../../../../Models/models';
@Component({
  selector: 'app-listar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './listar.html',
  styleUrl: './listar.css',
})
export class Listar implements OnInit {
  sucursales: Sucursales[] = [];
  searchNombre: string = ''; // Campo de búsqueda para el nombre de la sucursal

  constructor(private service: ServicesService, private router: Router) {}

  ngOnInit(): void {
    this.getSucursales();
  }

  getSucursales() {
    this.service.getSucursales().subscribe((data) => {
      this.sucursales = data;
    });
  }
  editarSucursal(id: number) {
    this.router.navigate(['panel-control/editar-sucursales', id]);
  }
  registrarSucursal() {
    this.router.navigate(['panel-control/registrar-sucursales']);
  }
  filteredSucursales(): Sucursales[] {
    if (this.searchNombre) {
      return this.sucursales.filter((sucursal) =>
        sucursal.nombre.toLowerCase().includes(this.searchNombre.toLowerCase())
      );
    }
    return this.sucursales;
  }
  toggleSucursalActivo(sucursal: Sucursales) {
    const nuevoEstado = !sucursal.estado;
    this.service
      .actualizarEstadoSucursales(sucursal.id, nuevoEstado)
      .subscribe(() => {
        sucursal.estado = nuevoEstado; // Actualiza el estado localmente después de la respuesta del servidor
      });
  }
}
