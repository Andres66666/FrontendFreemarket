import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  Cliente,
  Producto,
} from '../../../Models/models';

import { ServicesService } from '../../../Services/services.service';

@Component({
  selector: 'app-registrar-credito',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './registrar-credito.html',
  styleUrl: './registrar-credito.css',
})
export class RegistrarCredito implements OnInit {

  form!: FormGroup;

  productos: Producto[] = [];

  clienteEncontrado = false;

  mostrarFormularioCliente = false;

  clienteSeleccionado!: Cliente;

  constructor(
    private fb: FormBuilder,
    private service: ServicesService
  ) {}

  ngOnInit(): void {

  this.form = this.fb.group({
    ciBusqueda: ['', Validators.required],
    ciCliente: ['', Validators.required],
    nombre: [''],
    apellido: [''],
    telefono: [''],
    descripcion: [''],

    producto: ['', Validators.required],

    cantidad: [1, [Validators.required, Validators.min(1)]],
    cantidad_cuotas: [6, [Validators.required, Validators.min(1)]],

    precio_total: [0],
    cuota_mensual: [0],
  });

  this.cargarProductos();

  this.form.valueChanges.subscribe(() => {
    this.calcularCredito();
  });
}

  cargarProductos(): void {

    this.service.getProductos().subscribe({
      next: (data) => {

        this.productos = data.filter(
          p =>
            p.categoria?.nombre_categoria
              ?.toLowerCase() === 'celulares'
        );

      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  buscarCliente(): void {

    const ci =
      this.form.get('ciBusqueda')?.value;

    if (!ci) {
      alert('Ingrese un CI');
      return;
    }

    this.service.buscarClientePorCi(ci).subscribe({

      next: (cliente: Cliente) => {

        this.clienteEncontrado = true;
        this.mostrarFormularioCliente = false;

        this.clienteSeleccionado = cliente;

        this.form.patchValue({

          ciCliente: cliente.ci,
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          telefono: cliente.telefono,
          descripcion: cliente.descripcion,
        });
      },

      error: () => {

        this.clienteEncontrado = false;
        this.mostrarFormularioCliente = true;

        this.form.patchValue({

          ciCliente: ci,
          nombre: '',
          apellido: '',
          telefono: '',
          descripcion: '',
        });
      },
    });
  }

  registrarClienteRapido(): void {

    const cliente: Cliente = {

      id: 0,

      nombre: this.form.value.nombre,
      apellido: this.form.value.apellido,

      ci: this.form.value.ciCliente,

      telefono: this.form.value.telefono,
      descripcion: this.form.value.descripcion,
    };

    console.log(cliente);

    this.service.crearCliente(cliente).subscribe({

      next: (nuevoCliente: Cliente) => {

        this.clienteSeleccionado =
          nuevoCliente;

        this.clienteEncontrado = true;

        this.mostrarFormularioCliente = false;

        alert(
          'Cliente registrado correctamente'
        );
      },

      error: (error) => {

        console.error(error);

        if (error.error) {
          console.log(error.error);
        }

        alert(
          'Error al registrar cliente'
        );
      },
    });
  }
calcularCredito(cuotasValue?: number): void {

  const productoId = Number(this.form.value.producto);
  const cantidad = Number(this.form.value.cantidad);

  const cuotas = Number(cuotasValue ?? this.form.value.cantidad_cuotas);

  const producto = this.productos.find(p => p.id === productoId);

  if (!producto) return;

  if (!cuotas || cuotas <= 0) {
    this.form.patchValue({
      precio_total: 0,
      cuota_mensual: 0,
    }, { emitEvent: false });

    return;
  }

  const total = Number(producto.precio_unitario) * cantidad;
  const cuota = total / cuotas;

  this.form.patchValue({
    precio_total: total,
    cuota_mensual: Number(cuota.toFixed(2)),
  }, { emitEvent: false });
}
  guardarCredito(): void {

    if (!this.clienteSeleccionado) {

      alert(
        'Debe seleccionar o registrar un cliente'
      );

      return;
    }

    const usuario =
      this.service.getUsuarioLocalStorage();

    const data = {
      cliente_id: this.clienteSeleccionado.id,
      producto_id: Number(this.form.value.producto),
      usuario_id: usuario.usuario_id,

      cantidad: Number(this.form.value.cantidad),
      cantidad_cuotas: Number(this.form.value.cantidad_cuotas),

      precio_total: Number(this.form.value.precio_total),
      cuota_mensual: Number(this.form.value.cuota_mensual),
    };

    console.log(data);

    this.service.crearCredito(data).subscribe({

      next: () => {

        alert(
          'Crédito registrado correctamente'
        );

        this.form.reset();

        this.form.patchValue({
          cantidad: 1,
          cantidad_cuotas: 6,
        });

        this.clienteEncontrado = false;
        this.mostrarFormularioCliente = false;
      },

      error: (error) => {

        console.error(error);

        alert(
          'Error al registrar crédito'
        );
      },
    });
  }
}