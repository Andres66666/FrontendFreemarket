import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

@Component({
  selector: 'app-prestamos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prestamos.component.html',
  styleUrls: ['./prestamos.component.css'],
})
export class PrestamosComponent {
  // ================== VARIABLES ==================
  montoRaw: number = 0;
  montoFormateado: string = '';

  interes: number = 15;
  anios: number = 1;

  tipoPago: 'mensual' | 'semanal' = 'mensual';
  tipoInteres: 'anual' | 'mensual' | 'semanal' = 'anual';
  periodoTipo: 'anios' | 'meses' | 'semanas' = 'anios';

  fechaInicio!: string;
  today = new Date();

  cuotas: Cuota[] = [];

  totalPagado = 0;
  totalIntereses = 0;
  ganancia = 0;

  nombreCliente: string = '';
  carnetCliente: string = '';
  celularCliente: string = '';
  // ================== FORMATEO ==================
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
    this.montoFormateado =
      this.montoRaw > 0 ? this.formatearNumero(this.montoRaw) : '';
  }

  // ================== CALCULO METODO FRANCES ==================
  calcular() {
    this.cuotas = [];
    this.totalPagado = 0;
    this.totalIntereses = 0;
    this.ganancia = 0;

    if (this.montoRaw <= 0 || this.anios <= 0 || this.interes <= 0) {
      alert('Ingrese valores válidos');
      return;
    }

    // pagos por año
    const pagosPorAnio = this.tipoPago === 'mensual' ? 12 : 52;

    // ================== TOTAL DE CUOTAS ==================
    let n = 0;

    if (this.periodoTipo === 'anios') {
      n = this.anios * pagosPorAnio;
    } else if (this.periodoTipo === 'meses') {
      if (this.tipoPago === 'mensual') {
        n = this.anios; // 1 mes = 1 cuota
      } else {
        n = this.anios * 4; // aproximación: 1 mes ≈ 4 semanas
      }
    } else if (this.periodoTipo === 'semanas') {
      if (this.tipoPago === 'semanal') {
        n = this.anios; // 1 semana = 1 cuota
      } else {
        n = this.anios / 4; // aproximación: 4 semanas ≈ 1 mes
      }
    }

    n = Math.round(n); // aseguramos entero

    // ================== INTERES POR PERIODO ==================
    let i = 0;

    if (this.tipoInteres === 'anual') {
      i = this.interes / 100 / pagosPorAnio;
    } else if (this.tipoInteres === 'mensual') {
      i =
        this.tipoPago === 'mensual'
          ? this.interes / 100
          : this.interes / 100 / 4;
    } else if (this.tipoInteres === 'semanal') {
      i =
        this.tipoPago === 'semanal'
          ? this.interes / 100
          : (this.interes / 100) * 4;
    }

    // ================== CUOTA (METODO FRANCES) ==================
    const cuota =
      (this.montoRaw * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);

    let saldo = this.montoRaw;
    let fecha = this.fechaInicio ? new Date(this.fechaInicio) : new Date();

    for (let k = 1; k <= n; k++) {
      const interesCuota = saldo * i;
      const amortizacion = cuota - interesCuota;

      saldo -= amortizacion;

      this.totalIntereses += interesCuota;
      this.totalPagado += cuota;

      this.cuotas.push({
        nro: k,
        fecha: new Date(fecha),
        cuota: cuota,
        interes: interesCuota,
        amortizacion: amortizacion,
        saldo: saldo < 0 ? 0 : saldo,
      });

      // avanzar fecha
      if (this.tipoPago === 'mensual') {
        fecha.setMonth(fecha.getMonth() + 1);
      } else {
        fecha.setDate(fecha.getDate() + 7);
      }
    }

    this.ganancia = this.totalPagado - this.montoRaw;
  }
  generarPDF() {
    const doc = new jsPDF();

    // ================== TITULO ==================
    doc.setFontSize(16);
    doc.text('PLAN DE PRÉSTAMO', 105, 15, {
      align: 'center',
    });

    // ================== DATOS CLIENTE ==================
    doc.setFontSize(10);

    doc.text(`Nombre Cliente: ${this.nombreCliente}`, 14, 25);
    doc.text(`Carnet: ${this.carnetCliente}`, 14, 31);
    doc.text(`Celular: ${this.celularCliente}`, 14, 37);

    // ================== DATOS DEL PRESTAMO ==================
    doc.text(
      `Monto (Bs): ${this.montoRaw.toLocaleString('es-BO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      110,
      25
    );

    doc.text(`Interés (%): ${this.interes}`, 110, 31);

    doc.text(
      `Tiempo: ${this.anios} ${
        this.periodoTipo === 'anios'
          ? 'Años'
          : this.periodoTipo === 'meses'
          ? 'Meses'
          : 'Semanas'
      }`,
      110,
      37
    );

    doc.text(
      `Tipo Interés: ${
        this.tipoInteres === 'anual'
          ? 'Anual'
          : this.tipoInteres === 'mensual'
          ? 'Mensual'
          : 'Semanal'
      }`,
      110,
      43
    );

    doc.text(
      `Forma Pago: ${
        this.tipoPago === 'mensual' ? 'Mensual' : 'Semanal'
      }`,
      110,
      49
    );

    doc.text(
      `Fecha Inicio: ${
        this.fechaInicio
          ? new Date(this.fechaInicio).toLocaleDateString('es-BO')
          : new Date().toLocaleDateString('es-BO')
      }`,
      110,
      55
    );

    // ================== TABLA ==================
    const body = this.cuotas.map((c) => [
      '',
      c.nro,
      new Date(c.fecha).toLocaleDateString('es-BO'),
      this.formatearNumero(c.cuota),
      this.formatearNumero(c.interes),
      this.formatearNumero(c.amortizacion),
      this.formatearNumero(c.saldo),
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['✔', '#', 'Fecha', 'Cuota', 'Interés', 'Amortización', 'Saldo']],
      body: body,
      styles: {
        fontSize: 8,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 10 },
      },
      didDrawCell: (data) => {
        if (data.column.index === 0 && data.cell.section === 'body') {
          const x = data.cell.x + 2;
          const y = data.cell.y + 2;

          doc.rect(x, y, 4, 4);
        }
      },
    });

    // ================== RESUMEN ==================
    const finalTableY = (doc as any).lastAutoTable.finalY + 10;
    // ================== FIRMA CLIENTE ==================
    const firmaY = finalTableY + 35;

    // línea firma
    doc.line(60, firmaY, 150, firmaY);

    doc.setFontSize(10);

    doc.text(
      this.nombreCliente || 'NOMBRE DEL CLIENTE',
      105,
      firmaY + 8,
      { align: 'center' }
    );

    doc.text(
      `C.I. ${this.carnetCliente}`,
      105,
      firmaY + 14,
      { align: 'center' }
    );

    doc.text(
      `Cel. ${this.celularCliente}`,
      105,
      firmaY + 20,
      { align: 'center' }
    );

    doc.setFontSize(11);
   
    // ================== GUARDAR ==================
    doc.save('plan-pagos.pdf');
  }
}
