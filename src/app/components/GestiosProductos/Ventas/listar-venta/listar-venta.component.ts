import { Component, OnInit } from '@angular/core';
import { ServicesService } from '../../../../Services/services.service'; // Importa el servicio correspondiente
import { Venta } from '../../../../Models/models'; // Asegúrate de tener el modelo de Venta
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-listar-venta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './listar-venta.component.html',
  styleUrls: ['./listar-venta.component.css'],
})
export class ListarVentaComponent implements OnInit {
  ventas: Venta[] = []; // Array para almacenar las ventas
  searchID: string = ''; // Campo de búsqueda para el ID
  searchUsuario: string = ''; // Campo de búsqueda para el usuario
  searchTotal: string = ''; // Campo de búsqueda para el total
  searchEstado: string = ''; // Campo de búsqueda para el estado

  searchFechaInicio: string = ''; // Nueva propiedad para la fecha de inicio
  searchFechaFin: string = ''; // Nueva propiedad para la fecha de fin

  constructor(private servicesService: ServicesService) {}

  ngOnInit(): void {
    this.getVentas(); // Obtener las ventas al inicializar el componente
  }

  getVentas() {
    this.servicesService.getVentas().subscribe((data) => {
      this.ventas = data.sort((a, b) => {
        // Ordenar por fecha_venta en orden descendente
        return (
          new Date(b.fecha_venta).getTime() - new Date(a.fecha_venta).getTime()
        );
      });
    });
  }
// Método para obtener usuarios únicos
getUsuariosUnicos(): Venta[] {
  const uniqueMap = new Map<number, Venta>();
  this.ventas.forEach(venta => {
    if (!uniqueMap.has(venta.usuario.id)) {
      uniqueMap.set(venta.usuario.id, venta);
    }
  });
  return Array.from(uniqueMap.values());
}
filteredVentas(): Venta[] {
  let filtered = this.ventas;

  if (this.searchID) {
    filtered = filtered.filter(v => v.id.toString().includes(this.searchID));
  }

  if (this.searchUsuario) {
    const term = this.searchUsuario.toLowerCase();
    filtered = filtered.filter(v => 
      (v.usuario.nombre_usuario + ' ' + v.usuario.apellido).toLowerCase().includes(term)
    );
  }

  if (this.searchTotal) {
    filtered = filtered.filter(v => v.total.toString().includes(this.searchTotal));
  }

  if (this.searchEstado) {
    filtered = filtered.filter(v => v.estado.toLowerCase().includes(this.searchEstado.toLowerCase()));
  }

  if (this.searchFechaInicio) {
    const fechaInicio = new Date(this.searchFechaInicio).getTime();
    filtered = filtered.filter(v => new Date(v.fecha_venta).getTime() >= fechaInicio);
  }

  if (this.searchFechaFin) {
    const fechaFin = new Date(this.searchFechaFin).getTime();
    filtered = filtered.filter(v => new Date(v.fecha_venta).getTime() <= fechaFin + 86400000);
  }

  return filtered;
}

 
  updateList() {
    this.searchID = '';
    this.searchUsuario = '';
    this.searchTotal = '';
    this.searchEstado = '';
    this.searchFechaInicio = ''; 
    this.searchFechaFin = '';
    this.getVentas();
  }
}
