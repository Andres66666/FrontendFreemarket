// prestamos.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Cuota {
  nro: number;
  fecha: Date;
  cuota: number;
  interes: number;
  amortizacion: number;
  saldo: number;
}

type TipoPrenda =
  | 'VEHICULO_AUTO'
  | 'VEHICULO_MOTO'
  | 'VEHICULO_MAQUINARIA'
  | 'ELECTRONICO_CELULAR'
  | 'ELECTRONICO_LAPTOP'
  | 'ELECTRONICO_TABLET'
  | 'ELECTRONICO_TV'
  | 'ELECTRODOMESTICO'
  | 'MAQUINARIA_HERRAMIENTA'
  | 'MERCADERIA'
  | 'VALOR_DOCUMENTO'
  | 'GANADO'
  | 'JOYA'
  | 'DERECHO_DOCUMENTO'
  | 'EQUIPO_NEGOCIO'
  | 'OTRO';

@Component({
  selector: 'app-prestamos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './prestamos.component.html',
  styleUrls: ['./prestamos.component.css'],
})
export class PrestamosComponent {
  // ================== TU SIMULADOR EXISTENTE ==================
  montoRaw: number = 0;
  montoFormateado: string = '';

  interes: number = 15; // para el simulador (puedes mantenerlo)
  anios: number = 1;

  tipoPago: 'mensual' | 'semanal' = 'mensual';
  tipoInteres: 'anual' | 'mensual' | 'semanal' = 'anual';

  fechaInicio!: string;
  today = new Date();

  cuotas: Cuota[] = [];
  totalPagado = 0;
  totalIntereses = 0;
  ganancia = 0;

  // ================== NUEVO: TRÁMITE + CONTRATO ==================
  tramiteForm!: FormGroup;

  readonly tiposPrenda: { value: TipoPrenda; label: string }[] = [
    { value: 'VEHICULO_AUTO', label: 'Vehículo - Auto/Camioneta/Camión' },
    { value: 'VEHICULO_MOTO', label: 'Vehículo - Motocicleta' },
    { value: 'VEHICULO_MAQUINARIA', label: 'Vehículo - Maquinaria pesada' },

    { value: 'ELECTRONICO_CELULAR', label: 'Electrónico - Celular' },
    { value: 'ELECTRONICO_LAPTOP', label: 'Electrónico - Laptop/Computadora' },
    { value: 'ELECTRONICO_TABLET', label: 'Electrónico - Tablet' },
    { value: 'ELECTRONICO_TV', label: 'Electrónico - Televisor' },

    { value: 'ELECTRODOMESTICO', label: 'Electrodoméstico (refri/cocina/lavadora/micro)' },
    { value: 'MAQUINARIA_HERRAMIENTA', label: 'Maquinaria / Herramienta' },
    { value: 'MERCADERIA', label: 'Mercadería (stock)' },
    { value: 'VALOR_DOCUMENTO', label: 'Valores (cheque/letra/pagaré)' },
    { value: 'GANADO', label: 'Ganado (vacas/toros/ovejas/cerdos)' },
    { value: 'JOYA', label: 'Joyas / Objetos de valor' },
    { value: 'DERECHO_DOCUMENTO', label: 'Derechos o Documentos (contratos, acciones)' },
    { value: 'EQUIPO_NEGOCIO', label: 'Equipos de negocio (restaurante/peluquería/médico)' },
    { value: 'OTRO', label: 'Otro bien de valor' },
  ];
  // ===== CHECKLISTS (por tipo de prenda) =====
readonly estadosPrenda = [
  { label: 'Nuevo', value: 'NUEVO' },
  { label: 'Seminuevo', value: 'SEMINUEVO' },
  { label: 'Usado', value: 'USADO' },
];

// LAPTOP
readonly especificacionesLaptop = [
  { label: '8GB RAM', value: '8GB RAM' },
  { label: '16GB RAM', value: '16GB RAM' },
  { label: 'Disco 256GB SSD', value: '256GB SSD' },
  { label: 'Disco 512GB SSD', value: '512GB SSD' },
  { label: 'Disco 1TB HDD', value: '1TB HDD' },
  { label: 'Intel i3', value: 'Intel i3' },
  { label: 'Intel i5', value: 'Intel i5' },
  { label: 'Intel i7', value: 'Intel i7' },
  { label: 'Ryzen 3', value: 'Ryzen 3' },
  { label: 'Ryzen 5', value: 'Ryzen 5' },
  { label: 'Ryzen 7', value: 'Ryzen 7' },
];

readonly accesoriosLaptop = [
  { label: 'Cargador', value: 'Cargador' },
  { label: 'Funda/Maletín', value: 'Funda/Maletín' },
  { label: 'Mouse', value: 'Mouse' },
  { label: 'Teclado externo', value: 'Teclado externo' },
  { label: 'Caja', value: 'Caja' },
];

// CELULAR
readonly especificacionesCelular = [
  { label: 'Doble SIM', value: 'Doble SIM' },
  { label: '64GB', value: '64GB' },
  { label: '128GB', value: '128GB' },
  { label: '256GB', value: '256GB' },
  { label: '4GB RAM', value: '4GB RAM' },
  { label: '6GB RAM', value: '6GB RAM' },
  { label: '8GB RAM', value: '8GB RAM' },
  { label: '5G', value: '5G' },
];

readonly accesoriosCelular = [
  { label: 'Cargador', value: 'Cargador' },
  { label: 'Cable USB', value: 'Cable USB' },
  { label: 'Caja', value: 'Caja' },
  { label: 'Funda', value: 'Funda' },
  { label: 'Vidrio templado', value: 'Vidrio templado' },
];

// TV
readonly especificacionesTv = [
  { label: '32"', value: '32"' },
  { label: '40"', value: '40"' },
  { label: '43"', value: '43"' },
  { label: '50"', value: '50"' },
  { label: '55"', value: '55"' },
  { label: 'Smart TV', value: 'Smart TV' },
  { label: '4K', value: '4K' },
  { label: 'Full HD', value: 'Full HD' },
];

readonly accesoriosTv = [
  { label: 'Control remoto', value: 'Control remoto' },
  { label: 'Base', value: 'Base' },
  { label: 'Soporte pared', value: 'Soporte pared' },
  { label: 'Cable poder', value: 'Cable poder' },
];
onCheckboxChange(event: any, path: string) {
  const control = this.tramiteForm.get(path);
  if (!control) return;

  const current: string[] = control.value ? control.value.split(', ') : [];
  const value = event.target.value;

  if (event.target.checked) {
    if (!current.includes(value)) current.push(value);
  } else {
    const index = current.indexOf(value);
    if (index >= 0) current.splice(index, 1);
  }

  control.setValue(current.join(', '));
  control.markAsDirty();
  control.updateValueAndValidity();
}

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildTramiteForm();

    // Cambios tipo prenda => mostrar sección y requeridos
    this.tramiteForm.get('prenda.tipo')?.valueChanges.subscribe((tipo: TipoPrenda) => {
      this.applyPrendaValidators(tipo);
    });

    // Reglas por monto
    this.tramiteForm.get('prestamo.monto')?.valueChanges.subscribe((m: number) => {
      this.applyMontoRules(Number(m || 0));
    });

    // Placa requerida solo si "tiene placa" en moto
    this.tramiteForm.get('prenda.moto.placaTiene')?.valueChanges.subscribe((tiene: boolean) => {
      this.setRequired('prenda.moto.placa', !!tiene);
    });

    // Inicial
    this.applyPrendaValidators(this.tramiteForm.get('prenda.tipo')?.value);
    this.applyMontoRules(Number(this.tramiteForm.get('prestamo.monto')?.value || 0));
  }

  // ================== FORMATEO (tu mismo estilo) ==================
  formatearNumero(valor: number): string {
    return new Intl.NumberFormat('es-BO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor || 0);
  }

  limpiarFormato(valor: string): number {
    if (!valor) return 0;
    return Number(valor.replace(/\./g, '').replace(',', '.')) || 0;
  }

  onMontoFocus() {
    this.montoFormateado = this.montoRaw ? this.montoRaw.toString() : '';
  }

  onMontoBlur() {
    this.montoRaw = this.limpiarFormato(this.montoFormateado);
    this.montoFormateado = this.montoRaw > 0 ? this.formatearNumero(this.montoRaw) : '';
  }

  // ================== SIMULADOR (igual al tuyo) ==================
  calcular() {
    this.cuotas = [];
    this.totalPagado = 0;
    this.totalIntereses = 0;
    this.ganancia = 0;

    if (this.montoRaw <= 0 || this.anios <= 0 || this.interes <= 0) {
      alert('Ingrese valores válidos');
      return;
    }

    const pagosPorAnio = this.tipoPago === 'mensual' ? 12 : 52;
    const totalPagos = this.anios * pagosPorAnio;
    const interesPeriodo = this.calcularInteresPeriodo(pagosPorAnio);

    const cuota =
      (this.montoRaw * (interesPeriodo * Math.pow(1 + interesPeriodo, totalPagos))) /
      (Math.pow(1 + interesPeriodo, totalPagos) - 1);

    let saldo = this.montoRaw;
    let fecha = this.fechaInicio ? new Date(this.fechaInicio) : new Date();

    for (let i = 1; i <= totalPagos; i++) {
      const interesCuota = saldo * interesPeriodo;
      const amortizacion = cuota - interesCuota;
      saldo -= amortizacion;

      this.totalIntereses += interesCuota;
      this.totalPagado += cuota;

      this.cuotas.push({
        nro: i,
        fecha: new Date(fecha),
        cuota,
        interes: interesCuota,
        amortizacion,
        saldo: saldo < 0 ? 0 : saldo,
      });

      fecha = this.avanzarFecha(fecha);
    }

    this.ganancia = this.totalPagado - this.montoRaw;
  }

  calcularInteresPeriodo(pagosPorAnio: number): number {
    if (this.tipoInteres === 'anual') return this.interes / 100 / pagosPorAnio;
    return this.interes / 100;
  }

  avanzarFecha(fecha: Date): Date {
    const nueva = new Date(fecha);
    if (this.tipoPago === 'mensual') nueva.setMonth(nueva.getMonth() + 1);
    else nueva.setDate(nueva.getDate() + 7);
    return nueva;
  }

  // ================== NUEVO: FORM TRÁMITE ==================
  private buildTramiteForm() {
    this.tramiteForm = this.fb.group({
      contrato: this.fb.group({
        ciudad: ['Trinidad - Beni', [Validators.required]],
        fechaContrato: [this.toISODate(new Date()), [Validators.required]],
        fechaPagoPactada: [null, [Validators.required]],
        diasGracia: [0, [Validators.required, Validators.min(0), Validators.max(10)]],
        medioPago: ['EFECTIVO', [Validators.required]], // EFECTIVO | TRANSFERENCIA
        banco: [''],
        cuenta: [''],
      }),

      prestamista: this.fb.group({
        nombres: ['', [Validators.required]],
        ci: ['', [Validators.required]],
        telefono: [''],
        domicilio: [''],
      }),

      prestatario: this.fb.group({
        nombres: ['', [Validators.required]],
        ci: ['', [Validators.required]],
        extension: ['BN', [Validators.required]],
        telefono: [''],
        domicilio: [''],
      }),

      prestamo: this.fb.group({
        monto: [0, [Validators.required, Validators.min(1)]],
        interesMensualPct: [15, [Validators.required, Validators.min(0.1), Validators.max(200)]],
        moratorioMensualPct: [0, [Validators.min(0)]],
        modalidad: ['PLAZO_FIJO', [Validators.required]], // PLAZO_FIJO | PLAN_PAGOS
        plazoMeses: [1, [Validators.required, Validators.min(1)]],
      }),

      prenda: this.fb.group({
        tipo: ['ELECTRONICO_CELULAR' as TipoPrenda, [Validators.required]],
        valorDeclarado: [0, [Validators.required, Validators.min(1)]],
        observaciones: [''],

        // Vehículos
        auto: this.fb.group({
          marca: [''],
          modelo: [''],
          anio: [''],
          color: [''],
          placa: [''],
          nroMotor: [''],
          nroChasis: [''],
          ruat: [''],
          soatVigente: [false],
          inspeccionTecnica: [false],
          estado: [''],
        }),
        moto: this.fb.group({
          marca: [''],
          modelo: [''],
          anio: [''],
          color: [''],
          placaTiene: [true],
          placa: [''],
          nroMotor: [''],
          nroChasis: [''],
          ruat: [''],
          estado: [''],
          observaciones: [''],
        }),
        maquinariaVeh: this.fb.group({
          tipo: [''],
          marca: [''],
          modelo: [''],
          serie: [''],
          estado: [''],
          observaciones: [''],
        }),

        // Electrónicos
        celular: this.fb.group({
          marca: [''],
          modelo: [''],
          imei1: [''],
          imei2: [''],
          color: [''],
          especificaciones: [''],  // <-- agregar si no lo tienes
          estado: ['NUEVO'],
          accesorios: [''],
        }),
        laptop: this.fb.group({
          marca: [''],
          modelo: [''],
          serie: [''],
          especificaciones: [''],  // <-- aquí guardará "8GB RAM, 256GB SSD"
          estado: ['NUEVO'],       // <-- Estado select
          accesorios: [''],        // <-- aquí guardará "Cargador, Funda"
        }),
        tablet: this.fb.group({
          marca: [''],
          modelo: [''],
          serie: [''],
          estado: [''],
          accesorios: [''],
        }),
       tv: this.fb.group({
          marca: [''],
          pulgadas: [''],
          serie: [''],
          tipoPantalla: [''],
          especificaciones: [''],  // <-- agregar si no lo tienes
          estado: ['NUEVO'],
          accesorios: [''],
        }),
        // Otros
        electrodomestico: this.fb.group({
          tipo: [''],
          marca: [''],
          modelo: [''],
          serie: [''],
          estado: [''],
          accesorios: [''],
        }),
        herramienta: this.fb.group({
          tipo: [''],
          marca: [''],
          modelo: [''],
          serie: [''],
          capacidad: [''],
          estado: [''],
          accesorios: [''],
        }),
        mercaderia: this.fb.group({
          rubro: [''],
          detalleLote: [''],
          cantidad: [''],
          unidad: [''],
          estado: [''],
          lugarAlmacen: [''],
        }),
        valorDocumento: this.fb.group({
          tipo: [''],
          numero: [''],
          entidad: [''],
          monto: [''],
          fechaVenc: [''],
          titular: [''],
          observaciones: [''],
        }),
        ganado: this.fb.group({
          tipo: [''],
          cantidad: [''],
          identificacion: [''],
          edadAprox: [''],
          estadoSanitario: [''],
          lugarCustodia: [''],
        }),
        joya: this.fb.group({
          tipo: [''],
          material: [''],
          pureza: [''],
          pesoGramos: [''],
          piedras: [''],
          estado: [''],
        }),
        derechoDocumento: this.fb.group({
          tipo: [''],
          identificacion: [''],
          titular: [''],
          vigencia: [''],
          observaciones: [''],
        }),
        equipoNegocio: this.fb.group({
          tipo: [''],
          marca: [''],
          modelo: [''],
          serie: [''],
          estado: [''],
          accesorios: [''],
        }),
        otro: this.fb.group({
          descripcion: [''],
          identificacion: [''],
          estado: [''],
        }),
      }),
    });

    // Transferencia => banco y cuenta requeridos
    this.tramiteForm.get('contrato.medioPago')?.valueChanges.subscribe((m: 'EFECTIVO' | 'TRANSFERENCIA') => {
      const req = m === 'TRANSFERENCIA';
      this.setRequired('contrato.banco', req);
      this.setRequired('contrato.cuenta', req);
    });
  }

  private toISODate(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  private setRequired(path: string, required: boolean) {
    const c = this.tramiteForm.get(path);
    if (!c) return;
    c.setValidators(required ? [Validators.required] : []);
    c.updateValueAndValidity({ emitEvent: false });
  }

  private clearAllPrendaRequired() {
    // Solo manejamos requeridos esenciales por tipo; aquí dejamos “limpio”
    [
      // Auto
      'prenda.auto.marca',
      'prenda.auto.modelo',
      'prenda.auto.placa',
      'prenda.auto.nroMotor',
      'prenda.auto.estado',
      // Moto
      'prenda.moto.marca',
      'prenda.moto.modelo',
      'prenda.moto.nroMotor',
      'prenda.moto.estado',
      'prenda.moto.placa',
      // Celular
      'prenda.celular.marca',
      'prenda.celular.modelo',
      'prenda.celular.imei1',
      'prenda.celular.estado',
      // Laptop
      'prenda.laptop.marca',
      'prenda.laptop.modelo',
      'prenda.laptop.serie',
      'prenda.laptop.estado',
      // TV
      'prenda.tv.marca',
      'prenda.tv.pulgadas',
      'prenda.tv.estado',
      // Electrodoméstico
      'prenda.electrodomestico.tipo',
      'prenda.electrodomestico.marca',
      'prenda.electrodomestico.estado',
      // Herramienta
      'prenda.herramienta.tipo',
      'prenda.herramienta.marca',
      'prenda.herramienta.estado',
      // Mercadería
      'prenda.mercaderia.rubro',
      'prenda.mercaderia.detalleLote',
      'prenda.mercaderia.lugarAlmacen',
      // Valores
      'prenda.valorDocumento.tipo',
      'prenda.valorDocumento.numero',
      'prenda.valorDocumento.entidad',
      'prenda.valorDocumento.monto',
      'prenda.valorDocumento.fechaVenc',
      // Ganado
      'prenda.ganado.tipo',
      'prenda.ganado.cantidad',
      'prenda.ganado.lugarCustodia',
      // Joya
      'prenda.joya.tipo',
      'prenda.joya.material',
      'prenda.joya.pureza',
      'prenda.joya.pesoGramos',
      // Derechos
      'prenda.derechoDocumento.tipo',
      'prenda.derechoDocumento.identificacion',
      'prenda.derechoDocumento.titular',
      // Equipo negocio
      'prenda.equipoNegocio.tipo',
      'prenda.equipoNegocio.marca',
      'prenda.equipoNegocio.estado',
      // Otro
      'prenda.otro.descripcion',
      'prenda.otro.estado',
    ].forEach((p) => this.setRequired(p, false));
  }

  private applyPrendaValidators(tipo: TipoPrenda) {
    this.clearAllPrendaRequired();

    // requeridos generales
    this.tramiteForm.get('prenda.valorDeclarado')?.setValidators([Validators.required, Validators.min(1)]);
    this.tramiteForm.get('prenda.valorDeclarado')?.updateValueAndValidity({ emitEvent: false });

    if (tipo === 'VEHICULO_AUTO') {
      ['prenda.auto.marca', 'prenda.auto.modelo', 'prenda.auto.placa', 'prenda.auto.nroMotor', 'prenda.auto.estado'].forEach((p) =>
        this.setRequired(p, true)
      );
    }
    if (tipo === 'VEHICULO_MOTO') {
      ['prenda.moto.marca', 'prenda.moto.modelo', 'prenda.moto.nroMotor', 'prenda.moto.estado'].forEach((p) =>
        this.setRequired(p, true)
      );
      this.setRequired('prenda.moto.placa', !!this.tramiteForm.get('prenda.moto.placaTiene')?.value);
    }
    if (tipo === 'VEHICULO_MAQUINARIA') {
      ['prenda.maquinariaVeh.tipo', 'prenda.maquinariaVeh.marca', 'prenda.maquinariaVeh.estado'].forEach((p) =>
        this.setRequired(p, true)
      );
    }

    if (tipo === 'ELECTRONICO_CELULAR') {
      ['prenda.celular.marca', 'prenda.celular.modelo', 'prenda.celular.imei1', 'prenda.celular.estado'].forEach((p) =>
        this.setRequired(p, true)
      );
    }
    if (tipo === 'ELECTRONICO_LAPTOP') {
      ['prenda.laptop.marca', 'prenda.laptop.modelo', 'prenda.laptop.serie', 'prenda.laptop.estado'].forEach((p) =>
        this.setRequired(p, true)
      );
    }
    if (tipo === 'ELECTRONICO_TABLET') {
      ['prenda.tablet.marca', 'prenda.tablet.modelo', 'prenda.tablet.estado'].forEach((p) => this.setRequired(p, true));
    }
    if (tipo === 'ELECTRONICO_TV') {
      ['prenda.tv.marca', 'prenda.tv.pulgadas', 'prenda.tv.estado'].forEach((p) => this.setRequired(p, true));
    }

    if (tipo === 'ELECTRODOMESTICO') {
      ['prenda.electrodomestico.tipo', 'prenda.electrodomestico.marca', 'prenda.electrodomestico.estado'].forEach((p) =>
        this.setRequired(p, true)
      );
    }
    if (tipo === 'MAQUINARIA_HERRAMIENTA') {
      ['prenda.herramienta.tipo', 'prenda.herramienta.marca', 'prenda.herramienta.estado'].forEach((p) =>
        this.setRequired(p, true)
      );
    }
    if (tipo === 'MERCADERIA') {
      ['prenda.mercaderia.rubro', 'prenda.mercaderia.detalleLote', 'prenda.mercaderia.lugarAlmacen'].forEach((p) =>
        this.setRequired(p, true)
      );
    }
    if (tipo === 'VALOR_DOCUMENTO') {
      ['prenda.valorDocumento.tipo', 'prenda.valorDocumento.numero', 'prenda.valorDocumento.entidad', 'prenda.valorDocumento.monto', 'prenda.valorDocumento.fechaVenc'].forEach(
        (p) => this.setRequired(p, true)
      );
    }
    if (tipo === 'GANADO') {
      ['prenda.ganado.tipo', 'prenda.ganado.cantidad', 'prenda.ganado.lugarCustodia'].forEach((p) => this.setRequired(p, true));
    }
    if (tipo === 'JOYA') {
      ['prenda.joya.tipo', 'prenda.joya.material', 'prenda.joya.pureza', 'prenda.joya.pesoGramos'].forEach((p) =>
        this.setRequired(p, true)
      );
    }
    if (tipo === 'DERECHO_DOCUMENTO') {
      ['prenda.derechoDocumento.tipo', 'prenda.derechoDocumento.identificacion', 'prenda.derechoDocumento.titular'].forEach((p) =>
        this.setRequired(p, true)
      );
    }
    if (tipo === 'EQUIPO_NEGOCIO') {
      ['prenda.equipoNegocio.tipo', 'prenda.equipoNegocio.marca', 'prenda.equipoNegocio.estado'].forEach((p) => this.setRequired(p, true));
    }
    if (tipo === 'OTRO') {
      ['prenda.otro.descripcion', 'prenda.otro.estado'].forEach((p) => this.setRequired(p, true));
    }
  }

  // ================== REGLAS POR MONTO ==================
  private applyMontoRules(monto: number) {
    const modalidad = this.tramiteForm.get('prestamo.modalidad');
    const plazo = this.tramiteForm.get('prestamo.plazoMeses');

    if (!modalidad || !plazo) return;

    if (monto > 5000) {
      modalidad.setValue('PLAN_PAGOS', { emitEvent: false });
      if (!plazo.value || plazo.value < 1) plazo.setValue(1, { emitEvent: false });

      // Si quieres que el plan se calcule automático (mensual):
      // - convierto interés mensual a anual para tu simulador con tipoInteres='anual'
      const interesMensual = Number(this.tramiteForm.get('prestamo.interesMensualPct')?.value || 0);
      this.montoRaw = monto;
      this.montoFormateado = this.formatearNumero(monto);
      this.tipoPago = 'mensual';
      this.tipoInteres = 'anual';
      this.interes = interesMensual * 12; // anual equivalente
      this.anios = Number(plazo.value) / 12;
      this.fechaInicio = this.tramiteForm.get('contrato.fechaContrato')?.value || this.toISODate(new Date());
      this.calcular();
    } else {
      modalidad.setValue('PLAZO_FIJO', { emitEvent: false });

      if (monto >= 1000 && monto <= 2000) plazo.setValue(1, { emitEvent: false });
      else if (monto >= 2500 && monto <= 5000) plazo.setValue(2, { emitEvent: false });
      else if (monto > 0 && monto < 1000) plazo.setValue(1, { emitEvent: false });
      else plazo.setValue(1, { emitEvent: false });

      // Si no es plan, no necesito cuotas
      this.cuotas = [];
      this.totalPagado = 0;
      this.totalIntereses = 0;
      this.ganancia = 0;
    }
  }

  // ================== PDF CONTRATO ==================
// Reemplaza COMPLETO tu método generarContratoPDF() por este.
// ✅ Fuente: Helvetica (jsPDF no trae Arial real por defecto; Helvetica es el equivalente PDF estándar)
//    Si NECESITAS Arial sí o sí, te explico abajo cómo incrustar Arial.ttf.
// ✅ Tamaño 12 (cuerpo)
// ✅ Interlineado 1.0 (línea = fontSize * 0.35 en mm aprox; uso 5mm para 12pt en A4)
// ✅ Texto “justificado” (simulado): espaciado automático entre palabras línea por línea
// ✅ Firmas van inmediatamente después de la última cláusula (si no entra, crea nueva página SOLO para continuar, pero no “sección firmas aparte”)
// ✅ Salto automático de página, márgenes profesionales
// ✅ ANEXO plan de pagos se mantiene en página aparte (si corresponde)

generarContratoPDF() {
  if (this.tramiteForm.invalid) {
    this.tramiteForm.markAllAsTouched();
    alert('Complete los campos obligatorios del trámite.');
    return;
  }

  const v = this.tramiteForm.value;

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const marginL = 18;
  const marginR = 18;
  const marginT = 18;
  const marginB = 18;
  const maxW = pageWidth - marginL - marginR;

  // ===== TIPOGRAFÍA (Arial no está por defecto; Helvetica es estándar PDF) =====
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);

  // interlineado 1.0 (aprox 5mm en 12pt)
  const lineH = 5;

  let y = marginT;

  const ensureSpace = (neededMm: number) => {
    if (y + neededMm > pageHeight - marginB) {
      doc.addPage();
      y = marginT;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
    }
  };

  // ===== Justificación (simulada) =====
  const getTextWidth = (txt: string) => doc.getTextWidth(txt);

  const drawJustifiedLine = (words: string[], x: number, yLine: number, width: number) => {
    if (words.length <= 1) {
      doc.text(words.join(' '), x, yLine);
      return;
    }
    const textWidth = words.reduce((acc, w) => acc + getTextWidth(w), 0);
    const gaps = words.length - 1;
    const space = (width - textWidth) / gaps;
    let cursor = x;
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      doc.text(w, cursor, yLine);
      cursor += getTextWidth(w) + (i < words.length - 1 ? space : 0);
    }
  };

  const wrapWords = (text: string) =>
    (text || '')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(Boolean);

  const justifyParagraph = (text: string) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    const paragraphs = (text || '').split('\n').map(p => p.trim()).filter(p => p.length);

    for (const p of paragraphs) {
      const words = wrapWords(p);
      if (!words.length) {
        y += lineH;
        continue;
      }

      let lineWords: string[] = [];
      for (let i = 0; i < words.length; i++) {
        const w = words[i];
        const test = [...lineWords, w].join(' ');
        const wTest = getTextWidth(test);
        if (wTest <= maxW) {
          lineWords.push(w);
        } else {
          // dibuja línea justificada (no última)
          ensureSpace(lineH);
          drawJustifiedLine(lineWords, marginL, y, maxW);
          y += lineH;
          lineWords = [w];
        }
      }
      // última línea NO justificada (normal)
      if (lineWords.length) {
        ensureSpace(lineH);
        doc.text(lineWords.join(' '), marginL, y);
        y += lineH;
      }

      // separación mínima entre párrafos (interlineado 1.0, sin exagerar)
      y += 1.5;
    }
  };

  // ===== Helpers =====
  const addTitle = (text: string) => {
    ensureSpace(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(text, pageWidth / 2, y, { align: 'center' });
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
  };

  const addSub = (text: string) => {
    ensureSpace(7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(text, marginL, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
  };

  const addClause = (title: string, body: string) => {
    ensureSpace(8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(title, marginL, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    justifyParagraph(body);
    y += 2;
  };

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('es-BO');
  const money = (n: number) => `Bs. ${this.formatearNumero(Number(n || 0))}`;

  const ciudad = v.contrato.ciudad || '________';
  const fechaContratoISO = v.contrato.fechaContrato;
  const fechaPagoISO = v.contrato.fechaPagoPactada;

  const fechaContrato = fechaContratoISO ? fmtDate(fechaContratoISO) : '________';
  const fechaPago = fechaPagoISO ? fmtDate(fechaPagoISO) : '________';

  const diasGracia = Number(v.contrato.diasGracia || 0);

  // Plazo por fecha (meses + días)
  const d0 = fechaContratoISO ? new Date(fechaContratoISO) : new Date();
  const d1 = fechaPagoISO ? new Date(fechaPagoISO) : new Date(d0);
  const diffDays = Math.max(0, Math.ceil((d1.getTime() - d0.getTime()) / (1000 * 60 * 60 * 24)));
  const mesesAprox = Math.floor(diffDays / 30);
  const diasResto = diffDays % 30;

  const prestamista = v.prestamista || {};
  const prestatario = v.prestatario || {};
  const prestamo = v.prestamo || {};
  const prenda = v.prenda || {};

  const monto = Number(prestamo.monto || 0);
  const interesMensual = Number(prestamo.interesMensualPct || 0);
  const moratorioMensual = Number(prestamo.moratorioMensualPct || 0);
  const modalidad = prestamo.modalidad; // PLAZO_FIJO | PLAN_PAGOS

  const medioPago =
    v.contrato.medioPago === 'TRANSFERENCIA'
      ? `transferencia bancaria (${v.contrato.banco || '________'} / Cuenta: ${v.contrato.cuenta || '________'})`
      : 'efectivo';

  // ===== DOCUMENTO =====
  addTitle('CONTRATO DE PRÉSTAMO DE DINERO');
  justifyParagraph(`Lugar y fecha: ${ciudad}, ${fechaContrato}.`);

  addSub('Entre:');

  justifyParagraph(
    `Por una parte, ${prestamista.nombres || '________'}, mayor de edad, con C.I. Nº ${prestamista.ci || '________'}, domiciliado en ${prestamista.domicilio || '________'}, quien en adelante se denominará EL PRESTAMISTA.`
  );

  justifyParagraph(
    `Y por otra parte, ${prestatario.nombres || '________'}, mayor de edad, con C.I. Nº ${prestatario.ci || '________'}, domiciliado en ${prestatario.domicilio || '________'}, quien en adelante se denominará EL PRESTATARIO.`
  );

  justifyParagraph(
    'Ambas partes acuerdan celebrar el presente Contrato de Préstamo de Dinero, sujeto a las siguientes cláusulas:'
  );

  // 1
  addClause(
    'PRIMERA. (OBJETO)',
    `EL PRESTAMISTA entrega en calidad de préstamo a EL PRESTATARIO la suma de ${money(monto)} (${this.numeroALetrasBs(monto)} Bolivianos), monto que EL PRESTATARIO declara haber recibido a su entera satisfacción en fecha ${fechaContrato}.`
  );

  // 2
  addClause(
    'SEGUNDA. (DESTINO DEL PRÉSTAMO)',
    'EL PRESTATARIO destinará el dinero a ______________________, sin que ello afecte la obligación de pago.'
  );

  // 3
  addClause(
    'TERCERA. (PLAZO)',
    `El plazo para la devolución del préstamo será de ${mesesAprox} mes(es) y ${diasResto} día(s), computables a partir de la fecha de firma, venciendo el ${fechaPago}. Se establece un período de gracia de ${diasGracia} día(s) (máximo 10).`
  );

  // 4
  const formaPagoTxt =
    modalidad === 'PLAN_PAGOS'
      ? `Cuotas conforme al Plan de Pagos adjunto como ANEXO, pagaderas en forma mensual según cronograma.`
      : `Pago único al vencimiento (capital + intereses), con fecha pactada ${fechaPago}.`;

  addClause(
    'CUARTA. (FORMA DE PAGO)',
    `EL PRESTATARIO se obliga a devolver el monto prestado mediante: ${formaPagoTxt} Los pagos se realizarán en ${medioPago} a favor de EL PRESTAMISTA.`
  );

  // 5
  const interesesTxt =
    interesMensual > 0
      ? `Devenga un interés de ${this.formatearNumero(interesMensual)}% mensual. En caso de plan de pagos, los intereses se calcularán sobre el saldo de capital pendiente.`
      : 'No devenga intereses.';

  addClause('QUINTA. (INTERESES)', `El préstamo: ${interesesTxt}`);

  // 6
  const moraTxt =
    moratorioMensual > 0
      ? `En caso de retraso en el pago, EL PRESTATARIO incurrirá en mora automáticamente, aplicándose un interés moratorio del ${this.formatearNumero(moratorioMensual)}% adicional por cada periodo vencido, sin necesidad de intimación previa.`
      : `En caso de retraso en el pago, EL PRESTATARIO incurrirá en mora automáticamente, pudiendo EL PRESTAMISTA exigir el pago inmediato conforme a lo pactado.`;

  addClause('SEXTA. (MORA)', moraTxt);

  // 7 garantía
  const garantiaDetalle = this.resumenPrenda(prenda.tipo, prenda);
  addClause(
    'SÉPTIMA. (GARANTÍA)',
    `Para garantizar el cumplimiento del presente contrato, EL PRESTATARIO ofrece garantía real consistente en: ${this.labelPrenda(prenda.tipo)}. Valor declarado: ${money(prenda.valorDeclarado)}. Descripción: ${garantiaDetalle}. Observaciones: ${prenda.observaciones || '________'}.`
  );

  // 8
  addClause(
    'OCTAVA. (PAGO ANTICIPADO)',
    'EL PRESTATARIO podrá realizar pagos anticipados sin penalidad, reduciendo el saldo del capital adeudado.'
  );

  // 9
  addClause(
    'NOVENA. (INCUMPLIMIENTO)',
    `En caso de incumplimiento de pago en la fecha pactada más el período de gracia, EL PRESTAMISTA podrá exigir el pago total inmediato de la deuda, incluyendo intereses y gastos. Adicionalmente, la prenda/garantía entregada quedará a favor del EL PRESTAMISTA para cubrir la obligación, sin derecho a reclamo del EL PRESTATARIO, conforme a lo convenido entre partes.`
  );

  // 10
  addClause(
    'DÉCIMA. (GASTOS)',
    'Todos los gastos emergentes de este contrato, incluyendo reconocimiento de firmas, notarización u otros, serán asumidos por ______________________.'
  );

  // 11
  addClause(
    'DÉCIMA PRIMERA. (JURISDICCIÓN)',
    `Las partes se someten a la jurisdicción de los tribunales de la ciudad de ${ciudad}, Bolivia, renunciando a cualquier otro fuero.`
  );

  // 12
  addClause(
    'DÉCIMA SEGUNDA. (ACEPTACIÓN)',
    'Las partes declaran estar conformes con todas las cláusulas del presente contrato, firmando en señal de aceptación.'
  );

  // ===== FIRMAS INMEDIATAS (MISMA SECCIÓN, SIN “PÁGINA DE FIRMAS”) =====
  // Si no entra, salta de página, pero sigue siendo continuación del contrato.
  ensureSpace(55);

  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('FIRMAS', pageWidth / 2, y, { align: 'center' });
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);

  // Lineas
  const leftX = marginL;
  const rightX = pageWidth / 2 + 10;
  const lineW = (pageWidth / 2) - marginL - 10;

  // Prestamista
  doc.text('EL PRESTAMISTA', leftX, y);
  y += 10;
  doc.line(leftX, y, leftX + lineW, y);
  y += 6;
  doc.text(`Nombre: ${prestamista.nombres || '____________________'}`, leftX, y);
  y += 8;
  doc.text('Firma: ____________________', leftX, y);

  // Prestatario (columna derecha)
  const yBase = y - 24; // alinea arriba con prestamista
  doc.text('EL PRESTATARIO', rightX, yBase);
  doc.line(rightX, yBase + 10, rightX + lineW, yBase + 10);
  doc.text(`Nombre: ${prestatario.nombres || '____________________'}`, rightX, yBase + 16);
  doc.text('Firma: ____________________', rightX, yBase + 24);

  // Testigos
  y += 18;
  ensureSpace(30);

  doc.setFont('helvetica', 'bold');
  doc.text('Testigos (opcional):', leftX, y);
  doc.setFont('helvetica', 'normal');
  y += 10;

  doc.text('Nombre: ____________________   Firma: ____________________', leftX, y);
  y += 10;
  doc.text('Nombre: ____________________   Firma: ____________________', leftX, y);

  // ===== ANEXO PLAN DE PAGOS (página aparte) =====
  if (modalidad === 'PLAN_PAGOS' && this.cuotas?.length) {
    doc.addPage();
    y = marginT;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('ANEXO: PLAN DE PAGOS', pageWidth / 2, y, { align: 'center' });
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [['#', 'Fecha', 'Cuota (Bs)', 'Interés (Bs)', 'Amortización (Bs)', 'Saldo (Bs)']],
      body: this.cuotas.map((c) => [
        c.nro,
        new Date(c.fecha).toLocaleDateString('es-BO'),
        this.formatearNumero(c.cuota),
        this.formatearNumero(c.interes),
        this.formatearNumero(c.amortizacion),
        this.formatearNumero(c.saldo),
      ]),
      styles: { fontSize: 9, halign: 'right' },
      headStyles: {
        fillColor: false,
        textColor: 0,
        fontStyle: 'bold',
        halign: 'center',
        lineWidth: 0.1,
        lineColor: 200,
      },
      columnStyles: { 0: { halign: 'center' }, 1: { halign: 'center' } },
      margin: { left: 10, right: 10 },
      pageBreak: 'auto',
    });
  }

  doc.save(`contrato_prestamo_${this.toISODate(new Date())}.pdf`);
}

  private labelPrenda(tipo: TipoPrenda): string {
    const f = this.tiposPrenda.find((x) => x.value === tipo);
    return f ? f.label : tipo;
  }

  private resumenPrenda(tipo: TipoPrenda, p: any): string {
    const s = (x: any) => (x ?? '').toString().trim();
    if (tipo === 'VEHICULO_AUTO') {
      const a = p.auto || {};
      return `Marca ${s(a.marca)}, Modelo ${s(a.modelo)}, Año ${s(a.anio)}, Color ${s(a.color)}, Placa ${s(a.placa)}, Motor ${s(a.nroMotor)}, Chasis ${s(a.nroChasis)}, RUAT ${s(a.ruat)}, SOAT ${a.soatVigente ? 'Vigente' : 'No'}, Inspección ${a.inspeccionTecnica ? 'Al día' : 'No'}, Estado: ${s(a.estado)}.`;
    }
    if (tipo === 'VEHICULO_MOTO') {
      const m = p.moto || {};
      return `Marca ${s(m.marca)}, Modelo ${s(m.modelo)}, Año ${s(m.anio)}, Color ${s(m.color)}, Placa ${m.placaTiene ? s(m.placa) : 'SIN PLACA'}, Motor ${s(m.nroMotor)}, Chasis ${s(m.nroChasis)}, RUAT ${s(m.ruat)}, Estado: ${s(m.estado)}.`;
    }
    if (tipo === 'VEHICULO_MAQUINARIA') {
      const mv = p.maquinariaVeh || {};
      return `Tipo ${s(mv.tipo)}, Marca ${s(mv.marca)}, Modelo ${s(mv.modelo)}, Serie ${s(mv.serie)}, Estado: ${s(mv.estado)}.`;
    }

    if (tipo === 'ELECTRONICO_CELULAR') {
      const c = p.celular || {};
      return `Marca ${s(c.marca)}, Modelo ${s(c.modelo)}, IMEI1 ${s(c.imei1)}, IMEI2 ${s(c.imei2)}, Color ${s(c.color)}, Estado ${s(c.estado)}, Accesorios: ${s(c.accesorios)}.`;
    }
    if (tipo === 'ELECTRONICO_LAPTOP') {
      const l = p.laptop || {};
      return `Marca ${s(l.marca)}, Modelo ${s(l.modelo)}, Serie ${s(l.serie)}, Especificaciones ${s(l.especificaciones)}, Estado ${s(l.estado)}, Accesorios: ${s(l.accesorios)}.`;
    }
    if (tipo === 'ELECTRONICO_TABLET') {
      const t = p.tablet || {};
      return `Marca ${s(t.marca)}, Modelo ${s(t.modelo)}, Serie ${s(t.serie)}, Estado ${s(t.estado)}, Accesorios: ${s(t.accesorios)}.`;
    }
    if (tipo === 'ELECTRONICO_TV') {
      const tv = p.tv || {};
      return `Marca ${s(tv.marca)}, ${s(tv.pulgadas)}", Serie ${s(tv.serie)}, Tipo ${s(tv.tipoPantalla)}, Estado ${s(tv.estado)}, Accesorios: ${s(tv.accesorios)}.`;
    }

    if (tipo === 'ELECTRODOMESTICO') {
      const e = p.electrodomestico || {};
      return `Tipo ${s(e.tipo)}, Marca ${s(e.marca)}, Modelo ${s(e.modelo)}, Serie ${s(e.serie)}, Estado ${s(e.estado)}, Accesorios: ${s(e.accesorios)}.`;
    }
    if (tipo === 'MAQUINARIA_HERRAMIENTA') {
      const h = p.herramienta || {};
      return `Tipo ${s(h.tipo)}, Marca ${s(h.marca)}, Modelo ${s(h.modelo)}, Serie ${s(h.serie)}, Capacidad ${s(h.capacidad)}, Estado ${s(h.estado)}, Accesorios: ${s(h.accesorios)}.`;
    }
    if (tipo === 'MERCADERIA') {
      const m = p.mercaderia || {};
      return `Rubro ${s(m.rubro)}, Lote/Detalle: ${s(m.detalleLote)}, Cantidad ${s(m.cantidad)} ${s(m.unidad)}, Estado ${s(m.estado)}, Almacén/Custodia: ${s(m.lugarAlmacen)}.`;
    }
    if (tipo === 'VALOR_DOCUMENTO') {
      const d = p.valorDocumento || {};
      return `Tipo ${s(d.tipo)}, Nro ${s(d.numero)}, Entidad ${s(d.entidad)}, Monto ${s(d.monto)}, Vence ${s(d.fechaVenc)}, Titular ${s(d.titular)}.`;
    }
    if (tipo === 'GANADO') {
      const g = p.ganado || {};
      return `Tipo ${s(g.tipo)}, Cantidad ${s(g.cantidad)}, Identificación ${s(g.identificacion)}, Edad aprox ${s(g.edadAprox)}, Estado sanitario ${s(g.estadoSanitario)}, Custodia: ${s(g.lugarCustodia)}.`;
    }
    if (tipo === 'JOYA') {
      const j = p.joya || {};
      return `Tipo ${s(j.tipo)}, Material ${s(j.material)}, Pureza ${s(j.pureza)}, Peso ${s(j.pesoGramos)} g, Piedras ${s(j.piedras)}, Estado ${s(j.estado)}.`;
    }
    if (tipo === 'DERECHO_DOCUMENTO') {
      const dd = p.derechoDocumento || {};
      return `Tipo ${s(dd.tipo)}, Identificación ${s(dd.identificacion)}, Titular ${s(dd.titular)}, Vigencia ${s(dd.vigencia)}.`;
    }
    if (tipo === 'EQUIPO_NEGOCIO') {
      const en = p.equipoNegocio || {};
      return `Tipo ${s(en.tipo)}, Marca ${s(en.marca)}, Modelo ${s(en.modelo)}, Serie ${s(en.serie)}, Estado ${s(en.estado)}, Accesorios: ${s(en.accesorios)}.`;
    }
    const o = p.otro || {};
    return `Descripción ${s(o.descripcion)}, Identificación/Serie ${s(o.identificacion)}, Estado ${s(o.estado)}.`;
  }

  // ================== NÚMERO A LETRAS (simple) ==================
  // Si ya tienes una librería, reemplázalo. Esto es básico, pero funcional para contrato.
  private numeroALetrasBs(n: number): string {
    // Para mantener el ejemplo corto y seguro: devolvemos formato común.
    // (Si quieres literal completo "UN MIL DOSCIENTOS...", te lo hago en otra versión.)
    return this.formatearNumero(n);
  }

  // ================== TU PDF DE PLAN (igual al tuyo) ==================
  descargarPDF() {
    if (!this.cuotas || this.cuotas.length === 0) {
      alert('Primero debe generar el plan de pagos');
      return;
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFontSize(16);
    doc.text('PLAN DE PAGOS', 105, 15, { align: 'center' });

    const fechaTexto = this.fechaInicio
      ? new Date(this.fechaInicio).toLocaleDateString('es-BO')
      : new Date().toLocaleDateString('es-BO');

    doc.setFontSize(11);
    doc.text(`Fecha: ${fechaTexto}`, 105, 23, { align: 'center' });

    autoTable(doc, {
      startY: 30,
      head: [['#', 'Fecha', 'Cuota (Bs)', 'Interés (Bs)', 'Amortización (Bs)', 'Saldo (Bs)']],
      body: this.cuotas.map((c) => [
        c.nro,
        new Date(c.fecha).toLocaleDateString('es-BO'),
        this.formatearNumero(c.cuota),
        this.formatearNumero(c.interes),
        this.formatearNumero(c.amortizacion),
        this.formatearNumero(c.saldo),
      ]),
      styles: { fontSize: 9, halign: 'right' },
      headStyles: { fillColor: false, textColor: 0, fontStyle: 'bold', halign: 'center', lineWidth: 0.1, lineColor: 200 },
      columnStyles: { 0: { halign: 'center' }, 1: { halign: 'center' } },
      margin: { left: 10, right: 10 },
      pageBreak: 'auto',
      didDrawPage: () => {
        doc.setFontSize(9);
        doc.text(`Generado el ${new Date().toLocaleDateString('es-BO')}`, 105, 290, { align: 'center' });
      },
    });

    doc.save('plan_de_pagos.pdf');
  }

}