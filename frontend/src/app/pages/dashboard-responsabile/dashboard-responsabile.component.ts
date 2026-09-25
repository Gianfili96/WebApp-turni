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
import { Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { ConfermaDialogComponent } from '../../shared/components/conferma-dialog/conferma-dialog';
import { NotificaDialogComponent, NotificaDialogResult } from '../../shared/components/notifica-dialog/notifica-dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { RiepilogoOreDialogComponent } from '../../shared/components/riepilogo-ore-dialog/riepilogo-ore-dialog';
import { ProfiloAdminDialogComponent } from '../../shared/components/profilo-admin-dialog/profilo-admin-dialog';
import { MatMenuModule } from '@angular/material/menu';

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
    MatChipsModule,
    MatTabsModule,
    MatCheckboxModule,
    MatMenuModule
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

  //Reparto azione
  repartoAzione = 'ADDETTI_SERVIZI';

  constructor(
    private turniService: TurniService,
    private dipendentiService: DipendentiService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    public router: Router,
    private dialog: MatDialog
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
    this.cdr.detectChanges();
  }

  settimanaPrecedente(): void {
    const nuovaData = new Date(this.lunedi);
    nuovaData.setDate(this.lunedi.getDate() - 7);
    this.impostaSettimana(nuovaData);
    this.cdr.detectChanges();
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

  if (this.giorniSelezionati.length > 0 && !this.turnoInModifica) {
    const requests: TurnoRequest[] = [];

    // Turni per i giorni selezionati
    this.giorniSelezionati.forEach(giornoIndex => {
      const dataInizio = this.settimanaCorrente[giornoIndex];
      const dataInizioStr = this.formatData(dataInizio);

      let diffGiorni = 0;
      if (formValue.oraInizio && formValue.oraFine) {
        if (formValue.oraFine <= formValue.oraInizio) {
          diffGiorni = 1;
        }
      }

      const dataFine = new Date(dataInizio);
      dataFine.setDate(dataInizio.getDate() + diffGiorni);
      const dataFineStr = this.formatData(dataFine);

      requests.push({
        ...formValue,
        dataInizio: dataInizioStr,
        dataFine: dataFineStr
      });
    });

    // Turni per i giorni NON selezionati
    if (this.tipoGiornoLibero !== 'NESSUNO') {
      const giorniNonSelezionati = [0, 1, 2, 3, 4, 5, 6]
        .filter(i => !this.giorniSelezionati.includes(i));

      giorniNonSelezionati.forEach(giornoIndex => {
        const dataInizio = this.settimanaCorrente[giornoIndex];
        const dataInizioStr = this.formatData(dataInizio);

        requests.push({
          dipendenteId: formValue.dipendenteId,
          dataInizio: dataInizioStr,
          oraInizio: null,
          dataFine: dataInizioStr,
          oraFine: null,
          nota: null,
          tipo: this.tipoGiornoLibero as any
        });
      });
    }

    this.turniService.creaTurniMultipli(requests).subscribe({
      next: () => {
        this.mostraSuccesso(`${requests.length} turni creati con successo`);
        this.chiudiForm();
        setTimeout(() => this.caricaTurni(), 300);
      },
      error: (err) => this.mostraErrore(err.error?.messaggio || 'Errore nella creazione')
    });
  } else {
    if (this.turnoInModifica) {
      this.turniService.modificaTurno(this.turnoInModifica.id, formValue).subscribe({
        next: () => {
          this.mostraSuccesso('Turno modificato con successo');
          this.chiudiForm();
          setTimeout(() => this.caricaTurni(), 300);
        },
        error: (err) => this.mostraErrore(err.error?.messaggio || 'Errore nella modifica')
      });
    } else {
      this.turniService.creaTurno(formValue).subscribe({
        next: () => {
          this.mostraSuccesso('Turno creato con successo');
          this.chiudiForm();
          setTimeout(() => this.caricaTurni(), 300);
        },
        error: (err) => this.mostraErrore(err.error?.messaggio || 'Errore nella creazione')
      });
    }
  }
}

  eliminaTurno(id: number): void {
  const dialogRef = this.dialog.open(ConfermaDialogComponent, {
    width: '550px',
    data: { messaggio: 'Sei sicuro di voler eliminare questo turno?' }
  });

  dialogRef.afterClosed().subscribe(confermato => {
    if (!confermato) return;
    this.turniService.eliminaTurno(id).subscribe({
      next: () => {
        this.mostraSuccesso('Turno eliminato');
        this.caricaTurni();
      },
      error: () => this.mostraErrore('Errore nell\'eliminazione')
    });
  });
}

  chiudiForm(): void {
    this.showForm = false;
    this.turnoInModifica = null;
    this.turnoForm.reset({ tipo: 'TURNO' });
    this.giorniSelezionati = [];
    this.tipoGiornoLibero = 'NESSUNO';
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

  reparti = [
  { value: 'ADDETTI_SERVIZI',   label: '🧹 Addetti ai Servizi' },
  { value: 'CASSA',     label: '💰 Cassa' },
  { value: 'MECCANICO', label: '🔧 Meccanico' }
  ];

  getDipendentiPerReparto(reparto: string): Dipendente[] {
    return this.dipendenti.filter(d => d.reparto === reparto);
  }

  notaVisibile: { [key: number]: boolean } = {};

  toggleNota(turnoId: number): void {
    this.notaVisibile[turnoId] = !this.notaVisibile[turnoId];
  }

  notificaReparto(reparto: string): void {
  const repartoLabel = this.reparti.find(r => r.value === reparto)?.label || reparto;
  const dipendentiReparto = this.getDipendentiPerReparto(reparto);

  const dialogRef = this.dialog.open(NotificaDialogComponent, {
    width: '500px',
    data: {
      reparto,
      repartoLabel,
      dipendenti: dipendentiReparto
    }
  });

  dialogRef.afterClosed().subscribe((result: NotificaDialogResult) => {
      if (!result?.confermato) return;

      const dal = this.formatData(this.settimanaCorrente[0]);
      const al = this.formatData(this.settimanaCorrente[6]);

      this.turniService.notificaTurniReparto(reparto, dal, al, result.dipendentiSelezionati).subscribe({
        next: () => this.mostraSuccesso(`Notifica inviata a ${result.dipendentiSelezionati.length} dipendenti`),
        error: () => this.mostraErrore('Errore nell\'invio della notifica')
      });
    });
  }

  esportaPDF(reparto: string): void {
  const repartoLabel = this.reparti.find(r => r.value === reparto)?.label?.replace(/[^\w\s]/gi, '').trim() || reparto;

  // Determina quale elemento catturare in base al dispositivo
  const isMobile = window.innerWidth <= 768;
  const elemento = isMobile
    ? document.querySelector('.calendario-mobile') as HTMLElement
    : document.querySelector('.calendario-wrapper') as HTMLElement;

  if (!elemento) return;

  // Nascondi i bottoni durante l'export
  const bottoni = document.querySelectorAll('.turno-actions, .nota-badge, .turno-mobile-actions');
  bottoni.forEach(b => (b as HTMLElement).style.display = 'none');


  html2canvas(elemento, {
    scale: isMobile ? 3 : 2,
    useCORS: true,
    backgroundColor: '#ffffff'
  }).then(canvas => {
    bottoni.forEach(b => (b as HTMLElement).style.display = '');

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF(isMobile ? 'p' : 'l', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 35) / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;

    pdf.setFillColor(63, 81, 181);
    pdf.rect(0, 0, pdfWidth, 24, 'F');

    pdf.setFontSize(16);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Bowling Turni - Calendario Settimanale', pdfWidth / 2, 10, { align: 'center' });

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      `Reparto: ${repartoLabel} | Settimana: ${this.formatDataLabel(this.settimanaCorrente[0])} - ${this.formatDataLabel(this.settimanaCorrente[6])}`,
      pdfWidth / 2, 18, { align: 'center' }
    );

    pdf.addImage(imgData, 'PNG', imgX, 28, imgWidth * ratio, imgHeight * ratio);

    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      `Generato il ${new Date().toLocaleDateString('it-IT')}`,
      pdfWidth / 2, pdfHeight - 5, { align: 'center' }
    );

    pdf.save(`turni_${reparto}_${this.formatData(this.settimanaCorrente[0])}.pdf`);
    this.mostraSuccesso('PDF esportato con successo!');
  }).catch(() => {
    bottoni.forEach(b => (b as HTMLElement).style.display = '');
    this.mostraErrore('Errore nella generazione del PDF');
  });
}

  repartoAttivo = 'ADDETTI_SERVIZI';

  onTabChange(index: number): void {
    this.repartoAttivo = this.reparti[index].value;
  }

  apriRiepilogoOre(): void {
    const dal = this.formatData(this.settimanaCorrente[0]);
    const al = this.formatData(this.settimanaCorrente[6]);

    this.dialog.open(RiepilogoOreDialogComponent, {
      width: '560px',
      data: {
        dipendenti: this.dipendenti,
        dal,
        al
      }
    });
  }

  apriProfiloAdmin(): void {
    this.dialog.open(ProfiloAdminDialogComponent, {
      width: '95vw',
      maxWidth: '500px',
      maxHeight: '90vh',
    });
  }

  tipoGiornoLibero: string = 'NESSUNO';

  tipiGiornoLibero = [
    { value: 'NESSUNO',   label: 'Nessuno' },
    { value: 'RIPOSO',    label: 'Riposo' },
    { value: 'FERIE',     label: 'Ferie' },
    { value: 'MALATTIA',  label: 'Malattia' }
  ];

}