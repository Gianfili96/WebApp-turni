import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { TurniService } from '../../core/services/turni.service';
import { AuthService } from '../../core/services/auth.service';
import { Turno } from '../../models/turno.model';

@Component({
  selector: 'app-dashboard-addetto',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './dashboard-addetto.component.html',
  styleUrls: ['./dashboard-addetto.component.scss']
})
export class DashboardAddettoComponent implements OnInit {

  turni: Turno[] = [];
  settimanaCorrente: Date[] = [];
  lunedi: Date = new Date();
  nomeUtente = '';
  loading = true;

  giorni = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

  constructor(
    private turniService: TurniService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.nomeUtente = user?.nome || '';
    this.impostaSettimana(new Date());
  }

  impostaSettimana(data: Date): void {
    const giorno = data.getDay();
    const diff = giorno === 0 ? -6 : 1 - giorno;
    this.lunedi = new Date(data);
    this.lunedi.setDate(data.getDate() + diff);

    this.settimanaCorrente = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(this.lunedi);
      d.setDate(this.lunedi.getDate() + i);
      return d;
    });

    this.caricaTurni();
  }

  settimanaSuccessiva(): void {
    const nuovaData = new Date(this.lunedi);
    nuovaData.setDate(this.lunedi.getDate() + 7);
    this.impostaSettimana(nuovaData);
  }

  settimanaPrecedente(): void {
    const nuovaData = new Date(this.lunedi);
    nuovaData.setDate(this.lunedi.getDate() - 7);
    this.impostaSettimana(nuovaData);
  }

  caricaTurni(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    const dal = this.formatData(this.settimanaCorrente[0]);
    const al = this.formatData(this.settimanaCorrente[6]);
    this.loading = true;

    this.turniService.getTurniDipendente(user.dipendenteId, dal, al).subscribe({
      next: (data) => {
        this.turni = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => this.loading = false
    });
  }

  getTurniGiorno(giorno: Date): Turno[] {
    const giornoStr = this.formatData(giorno);
    return this.turni.filter(t => t.dataInizio === giornoStr);
  }

  isOggi(data: Date): boolean {
    const oggi = new Date();
    return data.toDateString() === oggi.toDateString();
  }

  logout(): void {
    this.authService.logout();
  }

  formatData(data: Date): string {
    const year = data.getFullYear();
    const month = String(data.getMonth() + 1).padStart(2, '0');
    const day = String(data.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDataLabel(data: Date): string {
    return data.toLocaleDateString('it-IT', { weekday: 'long', day: '2-digit', month: '2-digit' });
  }
}