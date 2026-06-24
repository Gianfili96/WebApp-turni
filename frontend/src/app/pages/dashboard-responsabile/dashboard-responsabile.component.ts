import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { TurniService } from '../../core/services/turni.service';
import { DipendentiService } from '../../core/services/dipendenti.service';
import { AuthService } from '../../core/services/auth.service';
import { Turno, TurnoRequest, Dipendente } from '../../models/turno.model';


@Component({
  selector: 'app-dashboard-responsabile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatCardModule,
    MatChipsModule
  ],
  templateUrl: './dashboard-responsabile.component.html',
  styleUrls: ['./dashboard-responsabile.component.scss']
})
export class DashboardResponsabileComponent implements OnInit {

    tipiTurno = [
    { value: 'TURNO',    label: 'Turno' },
    { value: 'FERIE',    label: 'Ferie' },
    { value: 'MALATTIA', label: 'Malattia' },
    { value: 'RIPOSO',   label: 'Riposo' }
  ];

  getColoreTurno(tipo: string): string {
    switch(tipo) {
      case 'FERIE':    return '#4caf50';
      case 'MALATTIA': return '#f44336';
      case 'RIPOSO':   return '#ff9800';
      default:         return '#3f51b5';
    }
  }

  // Giorni della settimana
  giorni = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

  dipendenti: Dipendente[] = [];
  turni: Turno[] = [];
  settimanaCorrente: Date[] = [];
  lunedi: Date = new Date();

  // Form turno
  showForm = false;
  turnoForm: FormGroup;
  turnoInModifica: Turno | null = null;

  nomeUtente = '';

  constructor(
    private turniService: TurniService,
    private dipendentiService: DipendentiService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.turnoForm = this.fb.group({
      dipendenteId: ['', Validators.required],
      dataInizio: ['', Validators.required],
      oraInizio: [''],
      dataFine: ['', Validators.required],
      oraFine: [''],
      nota: [''],
      tipo: ['TURNO', Validators.required]
    });
  }

  ngOnInit(): void {
    this.nomeUtente = this.authService.getCurrentUser()?.nome || '';
    this.impostaSettimana(new Date());
    this.caricaDipendenti();
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

  caricaDipendenti(): void {
  this.dipendentiService.getTutti().subscribe({
    next: (data) => {
      this.dipendenti = data;
      this.cdr.detectChanges(); // ← aggiungi questo
    },
    error: () => this.mostraErrore('Errore nel caricamento dipendenti')
  });
}

  caricaTurni(): void {
    const dal = this.formatData(this.settimanaCorrente[0]);
    const al = this.formatData(this.settimanaCorrente[6]);
    this.turniService.getTurniSettimana(dal, al).subscribe({
      next: (data) => {
        this.turni = data;
        this.cdr.detectChanges(); 
      },
      error: () => this.mostraErrore('Errore nel caricamento turni')
    });
  }

  getTurniPerDipendenteEGiorno(dipendenteId: number, giorno: Date): Turno[] {
    const giornoStr = this.formatData(giorno);
    return this.turni.filter(t =>
      t.dipendenteId === dipendenteId && t.dataInizio === giornoStr
    );
  }

  apriFormNuovoTurno(dipendenteId?: number, giorno?: Date): void {
    this.turnoInModifica = null;
    this.turnoForm.reset();
    if (dipendenteId) this.turnoForm.patchValue({ dipendenteId });
    if (giorno) {
      const dataStr = this.formatData(giorno);
      this.turnoForm.patchValue({ dataInizio: dataStr, dataFine: dataStr });
    }
    this.showForm = true;
  }

  apriFormModifica(turno: Turno): void {
    this.turnoInModifica = turno;
    this.turnoForm.patchValue({
      dipendenteId: turno.dipendenteId,
      dataInizio: turno.dataInizio,
      oraInizio: turno.oraInizio,
      dataFine: turno.dataFine,
      oraFine: turno.oraFine,
      nota: turno.nota
    });
    this.showForm = true;
  }

  salvaTurno(): void {
    if (this.turnoForm.invalid) return;

    const formValue = this.turnoForm.value;

    // Se ci sono più giorni selezionati crea turni multipli
    if (this.giorniSelezionati.length > 0 && !this.turnoInModifica) {
      const requests: TurnoRequest[] = this.giorniSelezionati.map(giornoIndex => {
        const dataInizio = this.settimanaCorrente[giornoIndex];
        const dataInizioStr = this.formatData(dataInizio);

        // Calcola differenza giorni tra dataInizio e dataFine del form
        const formDataInizio = new Date(formValue.dataInizio);
        const formDataFine = new Date(formValue.dataFine);
        const diffGiorni = Math.round(
          (formDataFine.getTime() - formDataInizio.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Applica la stessa differenza al giorno selezionato
        const dataFine = new Date(dataInizio);
        dataFine.setDate(dataInizio.getDate() + diffGiorni);
        const dataFineStr = this.formatData(dataFine);

        return {
          ...formValue,
          dataInizio: dataInizioStr,
          dataFine: dataFineStr
        };
      });

      this.turniService.creaTurniMultipli(requests).subscribe({
        next: () => {
          this.mostraSuccesso(`${requests.length} turni creati con successo`);
          this.chiudiForm();
          this.caricaTurni();
        },
        error: (err) => this.mostraErrore(err.error?.messaggio || 'Errore nella creazione')
      });
    } else {
      // Creazione/modifica singola
      if (this.turnoInModifica) {
        this.turniService.modificaTurno(this.turnoInModifica.id, formValue).subscribe({
          next: () => {
            this.mostraSuccesso('Turno modificato con successo');
            this.chiudiForm();
            this.caricaTurni();
          },
          error: (err) => this.mostraErrore(err.error?.messaggio || 'Errore nella modifica')
        });
      } else {
        this.turniService.creaTurno(formValue).subscribe({
          next: () => {
            this.mostraSuccesso('Turno creato con successo');
            this.chiudiForm();
            this.caricaTurni();
          },
          error: (err) => this.mostraErrore(err.error?.messaggio || 'Errore nella creazione')
        });
      }
    }
  }

  eliminaTurno(id: number): void {
    if (!confirm('Sei sicuro di voler eliminare questo turno?')) return;
    this.turniService.eliminaTurno(id).subscribe({
      next: () => {
        this.mostraSuccesso('Turno eliminato');
        this.caricaTurni();
      },
      error: () => this.mostraErrore('Errore nell\'eliminazione')
    });
  }

  chiudiForm(): void {
    this.showForm = false;
    this.turnoInModifica = null;
    this.turnoForm.reset({ tipo: 'TURNO' });
    this.giorniSelezionati = [];
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
    return data.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  private mostraSuccesso(msg: string): void {
    this.snackBar.open(msg, 'OK', { duration: 3000, panelClass: 'snack-success' });
  }

  private mostraErrore(msg: string): void {
    this.snackBar.open(msg, 'OK', { duration: 4000, panelClass: 'snack-error' });
  }

    onTipoChange(tipo: string): void {
    const oraInizio = this.turnoForm.get('oraInizio');
    const oraFine = this.turnoForm.get('oraFine');

    if (tipo === 'TURNO') {
      oraInizio?.setValidators(Validators.required);
      oraFine?.setValidators(Validators.required);
    } else {
      oraInizio?.clearValidators();
      oraFine?.clearValidators();
      oraInizio?.setValue('');
      oraFine?.setValue('');
    }

    oraInizio?.updateValueAndValidity();
    oraFine?.updateValueAndValidity();
  }

  isTurnoNormale(): boolean {
    return this.turnoForm.get('tipo')?.value === 'TURNO';
  }

  giorniSettimanaForm = [
    { label: 'Lun', value: 0 },
    { label: 'Mar', value: 1 },
    { label: 'Mer', value: 2 },
    { label: 'Gio', value: 3 },
    { label: 'Ven', value: 4 },
    { label: 'Sab', value: 5 },
    { label: 'Dom', value: 6 }
  ];

  giorniSelezionati: number[] = [];

  toggleGiorno(index: number): void {
    if (this.giorniSelezionati.includes(index)) {
      this.giorniSelezionati = this.giorniSelezionati.filter(g => g !== index);
    } else {
      this.giorniSelezionati.push(index);
    }
  }

  isGiornoSelezionato(index: number): boolean {
    return this.giorniSelezionati.includes(index);
  }
}