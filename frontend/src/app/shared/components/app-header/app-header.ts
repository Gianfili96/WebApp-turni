import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

export interface VoceMenu {
  id: string;
  label: string;
  icona: string;
}

export interface LinkNavigazione {
  label: string;
  route: string;
  icona: string;
}

// Intestazione indaco comune alle dashboard: logo, link, menu utente e contenuto proiettato sotto
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatMenuModule],
  templateUrl: './app-header.html',
  styleUrls: ['./app-header.scss']
})
export class AppHeaderComponent {
  @Input() nomeUtente = '';
  @Input() links: LinkNavigazione[] = [];
  @Input() vociMenu: VoceMenu[] = [];
  @Output() voceSelezionata = new EventEmitter<string>();

  getIniziali(): string {
    return this.nomeUtente
      .split(' ')
      .filter(p => p)
      .slice(0, 2)
      .map(p => p[0].toUpperCase())
      .join('');
  }
}
