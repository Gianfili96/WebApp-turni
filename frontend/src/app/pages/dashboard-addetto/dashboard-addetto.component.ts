import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppHeaderComponent, VoceMenu } from '../../shared/components/app-header/app-header';
import { TurniService } from '../../core/services/turni.service';
import { AuthService } from '../../core/services/auth.service';
import { Turno, TipoTurno } from '../../models/turno.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CambioPasswordDialogComponent } from '../../shared/components/cambio-password-dialog/cambio-password-dialog';
import { ProfiloDialogComponent } from '../../shared/components/profilo-dialog/profilo-dialog';

@Component({
  selector: 'app-dashboard-addetto',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    AppHeaderComponent
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
  giorniBrevi = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  vociMenu: VoceMenu[] = [
    { id: 'profilo',  label: 'Profilo',         icona: 'person_outline' },
    { id: 'password', label: 'Cambia password', icona: 'lock_outline' },
    { id: 'esci',     label: 'Esci',            icona: 'logout' }
  ];

  private readonly etichetteTipo: Record<TipoTurno, string> = {
    TURNO: 'Turno',
    FERIE: 'Ferie',
    MALATTIA: 'Malattia',
    RIPOSO: 'Riposo'
  };

  private readonly iconeTipo: Record<TipoTurno, string> = {
    TURNO: 'schedule',
    FERIE: 'beach_access',
    MALATTIA: 'medical_services',
    RIPOSO: 'weekend'
  };

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

  tornaAOggi(): void {
    this.impostaSettimana(new Date());
  }

  isSettimanaCorrente(): boolean {
    return this.settimanaCorrente.some(g => this.isOggi(g));
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
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
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

  isPassato(data: Date): boolean {
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    return data < oggi;
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
    return data.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  // Es. "13 – 19 ottobre 2026" oppure "27 ottobre – 2 novembre 2026"
  formatSettimana(): string {
    if (this.settimanaCorrente.length < 7) return '';
    const inizio = this.settimanaCorrente[0];
    const fine = this.settimanaCorrente[6];
    const mese = (d: Date) => d.toLocaleDateString('it-IT', { month: 'long' });
    const inizioStr = inizio.getMonth() === fine.getMonth()
      ? `${inizio.getDate()}`
      : `${inizio.getDate()} ${mese(inizio)}`;
    return `${inizioStr} – ${fine.getDate()} ${mese(fine)} ${fine.getFullYear()}`;
  }

  etichettaTipo(tipo: TipoTurno): string {
    return this.etichetteTipo[tipo] ?? tipo;
  }

  iconaTipo(tipo: TipoTurno): string {
    return this.iconeTipo[tipo] ?? 'event';
  }

  // Durata in minuti, anche per i turni a cavallo della mezzanotte
  private durataMinuti(turno: Turno): number {
    if (turno.tipo !== 'TURNO' || !turno.oraInizio || !turno.oraFine) return 0;
    const inizio = new Date(`${turno.dataInizio}T${turno.oraInizio}`);
    const fine = new Date(`${turno.dataFine}T${turno.oraFine}`);
    return Math.max(0, (fine.getTime() - inizio.getTime()) / 60000);
  }

  formatDurata(minuti: number): string {
    const ore = Math.floor(minuti / 60);
    const min = Math.round(minuti % 60);
    return min ? `${ore}h ${min}m` : `${ore}h`;
  }

  durataTurno(turno: Turno): string {
    return this.formatDurata(this.durataMinuti(turno));
  }

  oreSettimana(): string {
    return this.formatDurata(this.turni.reduce((tot, t) => tot + this.durataMinuti(t), 0));
  }

  numeroTurniSettimana(): number {
    return this.turni.filter(t => t.tipo === 'TURNO').length;
  }

  descrizioneTurno(turno: Turno | null): string {
    if (!turno) return 'Libero';
    return turno.tipo === 'TURNO'
      ? `${this.formatOrario(turno.oraInizio)} – ${this.formatOrario(turno.oraFine)}`
      : this.etichettaTipo(turno.tipo);
  }

  onVoceMenu(id: string): void {
    if (id === 'profilo') this.apriProfilo();
    if (id === 'password') this.apriCambioPassword();
    if (id === 'esci') this.logout();
  }

  getNome(): string {
    return this.nomeUtente.split(' ')[0] || '';
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
    if (!user) return;

    const oggi = this.formatData(new Date());
    const domani = new Date();
    domani.setDate(domani.getDate() + 1);
    const domaniStr = this.formatData(domani);

    this.turniService.getTurniDipendente(user.dipendenteId, oggi, domaniStr).subscribe({
      next: (data) => {
        this.turniOggiDomani = data;
        this.cdr.detectChanges();
      }
    });
  }

  getTurnoOggi(): Turno | null {
    const oggi = this.formatData(new Date());
    return this.turniOggiDomani.find(t => t.dataInizio === oggi) || null;
  }

  getTurnoDomani(): Turno | null {
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
