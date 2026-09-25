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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CambioPasswordDialogComponent } from '../../shared/components/cambio-password-dialog/cambio-password-dialog';
import { ProfiloDialogComponent } from '../../shared/components/profilo-dialog/profilo-dialog';

@Component({
  selector: 'app-dashboard-addetto',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatDialogModule
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
  oggi: Date = new Date();

  giorni = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

  constructor(
    private turniService: TurniService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog 
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.nomeUtente = user?.nome || '';
    this.impostaSettimana(new Date());
    this.caricaTurniOggiDomani();
    this.cdr.detectChanges();
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

  formatOrario(ora: string): string {
    return ora ? ora.substring(0, 5) : '';
  }

  formatDataLabel(data: Date): string {
    return data.toLocaleDateString('it-IT', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  getColoreTurno(tipo: string): string {
    switch(tipo) {
      case 'FERIE':    return '#4caf50';
      case 'MALATTIA': return '#f44336';
      case 'RIPOSO':   return '#ff9800';
      default:         return '#3f51b5';
    }
  }

  apriCambioPassword(): void {
  this.dialog.open(CambioPasswordDialogComponent, {
    width: '90vw',
    maxWidth: '480px',
    disableClose: true
  });
}

apriProfilo(): void {
  this.dialog.open(ProfiloDialogComponent, {
    width: '90vw',
    maxWidth: '480px'
  });
}

  turniOggiDomani: Turno[] = [];

  caricaTurniOggiDomani(): void {
  const user = this.authService.getCurrentUser();
  console.log('User:', user);
  console.log('DipendenteId:', user?.dipendenteId);
  if (!user) return;

  const oggi = this.formatData(new Date());
  const domani = new Date();
  domani.setDate(domani.getDate() + 1);
  const domaniStr = this.formatData(domani);
  
  console.log('Dal:', oggi, 'Al:', domaniStr);

  this.turniService.getTurniDipendente(user.dipendenteId, oggi, domaniStr).subscribe({
    next: (data) => {
      console.log('Turni oggi/domani:', data);
      this.turniOggiDomani = data;
      this.cdr.detectChanges();
    }
  });
}

  getTurnoOggi(): any {
    const oggi = this.formatData(new Date());
    return this.turniOggiDomani.find(t => t.dataInizio === oggi) || null;
  }

  getTurnoDomani(): any {
    const domani = new Date();
    domani.setDate(domani.getDate() + 1);
    return this.turniOggiDomani.find(t => t.dataInizio === this.formatData(domani)) || null;
  }

  getDomani(): Date {
    const domani = new Date();
    domani.setDate(domani.getDate() + 1);
    return domani;
  }
}