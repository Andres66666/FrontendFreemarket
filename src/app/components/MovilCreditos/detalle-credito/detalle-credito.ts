import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ActivatedRoute } from '@angular/router';

import {
  Credito,
  PagoCredito,
} from '../../../Models/models';
import { ServicesService } from '../../../Services/services.service';


@Component({
  selector: 'app-detalle-credito',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './detalle-credito.html',
  styleUrl: './detalle-credito.css',
})
export class DetalleCredito implements OnInit {

  credito!: Credito;

  pagos: PagoCredito[] = [];

  formPago!: FormGroup;

  creditoId = 0;

  cargando = true;
  cuotas: any[] = [];
  loadingPago = false;
  constructor(
    private route: ActivatedRoute,
    private service: ServicesService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {

    this.formPago = this.fb.group({
      monto_pagado: [
        '',
        Validators.required
      ],
      observacion: ['']
    });

    this.creditoId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.cargarCredito();
    this.cargarPagos();
    this.generarCuotas();
  }
get creditoFinalizado(): boolean {
  return this.credito?.estado === 'PAGADO';
}
cargarCredito(): void {
  this.service.getCreditoById(this.creditoId).subscribe({
    next: (data) => {
      this.credito = data;
      this.cargando = false;

      this.generarCuotas(); // 👈 AQUÍ
    },
    error: (error) => {
      console.error(error);
      this.cargando = false;
    },
  });
}

cargarPagos(): void {

  this.service
    .getPagosCredito()
    .subscribe({
      next: (data) => {

        this.pagos =
          data.filter(
            x => x.credito.id === this.creditoId
          );

        this.generarCuotas(); // IMPORTANTE
      },
    });
}
generarCuotas(): void {
  if (!this.credito) return;

  const totalCuotas = Number(this.credito.cantidad_cuotas || 0);
  const monto = Number(this.credito.cuota_mensual || 0);

  this.cuotas = [];

  for (let i = 1; i <= totalCuotas; i++) {

    const pagado = this.pagos.some(
      p => p.numero_cuota === i
    );

    if (!pagado) {
      this.cuotas.push({
        numero: i,
        monto: monto
      });
    }
  }
}
get cuotasPagadas(): number {
  return this.pagos.length;
}
registrarPagoCuota(numero: number, monto: number): void {

  if (this.loadingPago) return;

  if (this.pagos.length >= this.credito.cantidad_cuotas) {
    alert('Este crédito ya completó todas sus cuotas');
    return;
  }

  this.loadingPago = true;

  const yaPagado = this.pagos.some(p => p.numero_cuota === numero);
  if (yaPagado) {
    alert('Esta cuota ya fue pagada');
    this.loadingPago = false;
    return;
  }

  const data = {
    credito_id: this.creditoId,
    numero_cuota: numero,
    monto_pagado: monto,
    observacion: 'Pago automático cuota'
  };

  this.service.crearPagoCredito(data).subscribe({
    next: () => {
      this.cargarCredito();
      this.cargarPagos();
      this.loadingPago = false;
    },
    error: (err) => {
      console.error(err);
      this.loadingPago = false;
    }
  });
}
 registrarPago(): void {

  if (this.formPago.invalid) {
    this.formPago.markAllAsTouched();
    return;
  }

  const data = {
    credito_id: this.creditoId,  // ✅ AQUÍ ESTÁ EL FIX

    numero_cuota: this.credito.cuotas_pagadas + 1,

    monto_pagado: this.formPago.value.monto_pagado,

    observacion: this.formPago.value.observacion,
  };

  console.log(data); // 👈 recomendable para verificar

  this.service.crearPagoCredito(data).subscribe({
    next: () => {

      alert('Pago registrado');

      this.formPago.reset();

      this.cargarCredito();
      this.cargarPagos();
    },
    error: (err) => {
      console.error(err);
      alert('Error al registrar pago');
    }
  });
}

  getTotalPagado(): number {

    return this.pagos.reduce(
      (total, pago) =>
        total + Number(pago.monto_pagado),
      0
    );
  }
}