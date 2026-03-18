// dashboard.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';

type ImageItem = {
  src: string;
  category: 'bancos' | 'juegos' | string;
  alt: string;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  images: ImageItem[] = [
    {
      src: 'https://res.cloudinary.com/dz45dhxii/image/upload/v1767918463/BCP_rchxxv.jpg',
      category: 'bancos',
      alt: 'BCP Andres',
    },
    {
      src: 'https://res.cloudinary.com/dz45dhxii/image/upload/v1773843787/QR_Andres_2_mxqkcw.jpg',
      category: 'bancos',
      alt: 'QR Unión Andres 0',
    },
    {
      src: 'https://res.cloudinary.com/dz45dhxii/image/upload/v1773843787/QR_Andres_1_lwydyj.jpg',
      category: 'bancos',
      alt: 'QR Unión Andres 1',
    },
    {
      src: 'https://res.cloudinary.com/dz45dhxii/image/upload/v1767918464/YAPE_shmdtn.jpg',
      category: 'bancos',
      alt: 'Yape Andres',
    },
    {
      src: 'https://res.cloudinary.com/dz45dhxii/image/upload/v1773860535/yasta_v3vrmk.jpg',
      category: 'bancos',
      alt: 'Yasta Andres',
    },
    {
      src: 'https://res.cloudinary.com/dz45dhxii/image/upload/v1771986339/takenos_b8aba9.jpg',
      category: 'bancos',
      alt: 'Takenos Andres',
    },
    {
      src: 'https://res.cloudinary.com/dz45dhxii/image/upload/v1773792023/QR_jhovana_aihgv7.jpg',
      category: 'bancos',
      alt: 'QR Jhovana',
    },
    {
      src: 'https://res.cloudinary.com/dz45dhxii/image/upload/v1773792026/QR_sonia_ib9zic.jpg',
      category: 'bancos',
      alt: 'QR Sonia',
    },
  ];

  selectedCategory = '';
  filteredImages: ImageItem[] = [...this.images];

  currentIndex = 0;
  showModal = false;

  whatsappNumber = '';

  get currentImage(): ImageItem | null {
    return this.filteredImages?.length
      ? this.filteredImages[this.currentIndex]
      : null;
  }

  filterImages(): void {
    this.filteredImages = this.selectedCategory
      ? this.images.filter((img) => img.category === this.selectedCategory)
      : [...this.images];

    this.currentIndex = 0;
  }

  openModal(index: number): void {
    this.currentIndex = index;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  sendToWhatsapp(): void {
    const img = this.currentImage;

    if (!img) return;

    const phone = (this.whatsappNumber || '').replace(/\D/g, '');

    const msg = `Imagen: ${img.alt}\n${img.src}`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

    window.open(url, '_blank');
  }

  sendGameToWhatsapp(): void {
    const phone = (this.whatsappNumber || '').replace(/\D/g, '');

    const gameLink =
      'https://www.canva.com/design/DAGyyFxind4/EQtCcchUR3V2dc-3_OJgDQ/view';

    const msg = `🎮 Te comparto este juego:\n${gameLink}`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

    window.open(url, '_blank');
  }

  async copyImageLink(): Promise<void> {
    const img = this.currentImage;

    if (!img) return;

    await navigator.clipboard.writeText(img.src);

    alert('Link copiado');
  }
}
