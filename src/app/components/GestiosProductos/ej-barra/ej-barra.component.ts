import {
  Component,
  EventEmitter,
  Output,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  ZXingScannerComponent,
  ZXingScannerModule
} from '@zxing/ngx-scanner';

import { BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-ej-barra',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ZXingScannerModule
  ],
  templateUrl: './ej-barra.component.html',
  styleUrls: ['./ej-barra.component.css']
})
export class EjBarraComponent {

  @ViewChild('scanner')
  scanner!: ZXingScannerComponent;

  @Output()
  codigoEscaneado = new EventEmitter<string>();

  scannedResult = '';

  camaraActivada = false;

  hasPermission = false;

  hasDevices = false;

  availableDevices: MediaDeviceInfo[] = [];

  currentDevice?: MediaDeviceInfo;

  zoomValue = 1;

  linternaActiva = false;

  torchAvailable = false;

  videoTrack?: MediaStreamTrack;

  formatsEnabled: BarcodeFormat[] = [
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_39,
    BarcodeFormat.CODE_93,
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E
  ];

  activarCamara(): void {
    this.camaraActivada = true;

    setTimeout(() => {
      this.configurarCamara();
    }, 1000);
  }

  cerrarCamara(): void {

    this.camaraActivada = false;

    if (this.videoTrack) {
      this.videoTrack.stop();
    }

    this.videoTrack = undefined;
  }

  onCodeResult(result: string): void {

    this.scannedResult = result;

    console.log('Código leído:', result);

    this.codigoEscaneado.emit(result);
  }

  onHasPermission(permission: boolean): void {

    this.hasPermission = permission;

    console.log('Permiso:', permission);
  }

  onCamerasFound(devices: MediaDeviceInfo[]): void {

    this.availableDevices = devices;

    this.hasDevices = devices.length > 0;

    const rearCamera = devices.find(device =>
      device.label.toLowerCase().includes('back') ||
      device.label.toLowerCase().includes('rear')
    );

    this.currentDevice = rearCamera || devices[0];
  }

  async configurarCamara(): Promise<void> {

    try {

      const stream =
        await navigator.mediaDevices.getUserMedia({

          video: {
            facingMode: {
              ideal: 'environment'
            },

            width: {
              ideal: 1920
            },

            height: {
              ideal: 1080
            },

            frameRate: {
              ideal: 60
            }
          }
        });

      this.videoTrack = stream.getVideoTracks()[0];

      const capabilities: any =
        this.videoTrack.getCapabilities();

      console.log('Capabilities:', capabilities);

      if (capabilities.torch) {
        this.torchAvailable = true;
      }

      if (
        capabilities.focusMode &&
        capabilities.focusMode.includes('continuous')
      ) {

        await this.videoTrack.applyConstraints({
          advanced: [
            {
              focusMode: 'continuous'
            } as any
          ]
        });
      }

      if (capabilities.zoom) {

        const zoomInicial =
          Math.min(2, capabilities.zoom.max);

        await this.videoTrack.applyConstraints({
          advanced: [
            {
              zoom: zoomInicial
            } as any
          ]
        });

        this.zoomValue = zoomInicial;
      }

    } catch (error) {

      console.error(
        'Error configurando cámara:',
        error
      );
    }
  }

  async aplicarZoom(): Promise<void> {

    if (!this.videoTrack) {
      return;
    }

    try {

      await this.videoTrack.applyConstraints({
        advanced: [
          {
            zoom: this.zoomValue
          } as any
        ]
      });

    } catch (error) {

      console.error(error);
    }
  }

  async toggleLinterna(): Promise<void> {

    if (!this.videoTrack) {
      return;
    }

    try {

      this.linternaActiva =
        !this.linternaActiva;

      await this.videoTrack.applyConstraints({
        advanced: [
          {
            torch: this.linternaActiva
          } as any
        ]
      });

    } catch (error) {

      console.error(error);
    }
  }
}