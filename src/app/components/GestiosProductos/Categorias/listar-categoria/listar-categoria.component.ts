import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Categoria } from '../../../../Models/models'; // Asegúrate de importar el modelo Categoria
import { ServicesService } from '../../../../Services/services.service'; // Asegúrate de tener el servicio para las categorías
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listar-categoria',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './listar-categoria.component.html',
  styleUrls: ['./listar-categoria.component.css'],
})
export class ListarCategoriaComponent implements OnInit {
  categorias: Categoria[] = []; // Array para almacenar las categorías
  searchNombreCategoria: string = ''; // Campo de búsqueda para el nombre de la categoría
  
  paginatedCategorias: Categoria[] = []; // Categorías paginadas
  loading: boolean = true;

  
  constructor(private servicesService: ServicesService,    private router: Router
  ) {}

  ngOnInit(): void {
    this.getCategorias(); // Obtener las categorías al inicializar el componente
  }

  getCategorias() {
    this.loading = true; // Iniciar el estado de carga
    this.servicesService.getCategorias().subscribe(
      (data) => {
      this.categorias = data; // Asignar las categorías obtenidas
      this.loading = false;
      },
      () => {
        this.loading = false; // Finalizar el estado de carga en caso de error
      }
    );
  }

  editarCategoriaClick(id: number) {
    this.router.navigate(['panel-control/editar-categorias', id]);
  }

  registrarCategoriaClick() {
    this.router.navigate(['panel-control/registrar-categorias']);
  }


  filteredCategorias(): Categoria[] {
    let filtered = this.categorias;

    if (this.searchNombreCategoria) {
      const term = this.searchNombreCategoria.toLowerCase().trim();
      filtered = filtered.filter(c => 
        c.nombre_categoria.toLowerCase().includes(term)
      );
    }

    // Inactivos al final
    const inactivos = filtered.filter(c => !c.estado_categoria);
    const activos = filtered.filter(c => c.estado_categoria);
    
    return [...activos, ...inactivos];
  }



  toggleCategoriaActivo(Categoria: Categoria) {
    // Invertir el estado de 'estadoCategoria' del Categoria
    Categoria.estado_categoria = !Categoria.estado_categoria; // Cambiar el estado del Categoria

    // Llamar a un servicio que actualice el estado del Categoria en el servidor
    this.servicesService
      .actualizarEstadoCategoria(Categoria.id, Categoria.estado_categoria)
      .subscribe(
        (response) => {
          console.log(
            `Categoria ${Categoria.nombre_categoria} actualizado exitosamente.`
          );
        },
        (error) => {
          console.error('Error al actualizar el estado del Categoria:', error);
          // Si hay un error, revertir el cambio de estado
          Categoria.estado_categoria = !Categoria.estado_categoria; // Revertir el estado
        }
      );
  }
}
