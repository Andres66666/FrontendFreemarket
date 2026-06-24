import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { Credito } from '../../../Models/models';
import { ServicesService } from '../../../Services/services.service';

@Component({
  selector: 'app-listar-creditos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './listar-creditos.html',
  styleUrl: './listar-creditos.css',
})
export class ListarCreditos implements OnInit {
  creditos: Credito[] = [];
  creditosFiltrados: Credito[] = [];

  textoBusqueda = '';
  cargando = false;

  constructor(
    private service: ServicesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarCreditos();
  }

  cargarCreditos(): void {
    this.cargando = true;

    this.service.getCreditos().subscribe({
      next: (data) => {
        this.creditos = data;
        this.creditosFiltrados = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error(error);
        this.cargando = false;
      },
    });
  }

  buscar(event: Event): void {
    const valor = (event.target as HTMLInputElement)
      .value
      .toLowerCase();

    this.textoBusqueda = valor;

    this.creditosFiltrados = this.creditos.filter((credito) =>
      `${credito.cliente.nombre} ${credito.cliente.apellido}`
        .toLowerCase()
        .includes(valor)
    );
  }

  verDetalle(id: number): void {
    this.router.navigate([
      '/panel-control/detalle-credito',
      id,
    ]);
  }

  nuevoCredito(): void {
    this.router.navigate([
      '/panel-control/registrar-credito',
    ]);
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'PAGADO':
        return 'estado-pagado';

      case 'PAGANDO':
        return 'estado-pagando';

      default:
        return 'estado-pendiente';
    }
  }
}