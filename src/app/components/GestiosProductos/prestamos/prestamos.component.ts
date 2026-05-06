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

    // ================== DATOS ==================
    doc.setFontSize(10);
    doc.text(`Monto: Bs ${this.montoRaw.toFixed(2)}`, 14, 25);
    doc.text(`Interés: ${this.interes}%`, 14, 30);
    doc.text(`Periodo: ${this.anios} ${this.periodoTipo}`, 14, 35);

    doc.text(
      `Fecha inicio: ${
        this.fechaInicio
          ? new Date(this.fechaInicio).toLocaleDateString()
          : new Date().toLocaleDateString()
      }`,
      14,
      40,
    );

    // ================== TABLA ==================
    const body = this.cuotas.map((c) => [
      '', // columna checkbox
      c.nro,
      new Date(c.fecha).toLocaleDateString(),
      c.cuota.toFixed(2),
      c.interes.toFixed(2),
      c.amortizacion.toFixed(2),
      c.saldo.toFixed(2),
    ]);

    autoTable(doc, {
      startY: 45,
      head: [['✔', '#', 'Fecha', 'Cuota', 'Interés', 'Amortización', 'Saldo']],
      body: body,
      styles: {
        fontSize: 8,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 10 }, // checkbox
      },
      didDrawCell: (data) => {
        // SOLO columna checkbox
        if (data.column.index === 0 && data.cell.section === 'body') {
          const x = data.cell.x + 2;
          const y = data.cell.y + 2;

          // dibujar cuadrado
          doc.rect(x, y, 4, 4);
        }
      },
    });

    // ================== GUARDAR ==================
    doc.save('plan-pagos.pdf');
  }
}
