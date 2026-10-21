import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DipendentiService } from '../../core/services/dipendenti.service';
import { AuthService } from '../../core/services/auth.service';
import { Dipendente } from '../../models/turno.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfermaDialogComponent } from '../../shared/components/conferma-dialog/conferma-dialog';
import { ProfiloAdminDialogComponent } from '../../shared/components/profilo-admin-dialog/profilo-admin-dialog';
import { AppHeaderComponent, LinkNavigazione, VoceMenu } from '../../shared/components/app-header/app-header';

@Component({
  selector: 'app-gestione-dipendenti',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDialogModule,
    AppHeaderComponent
  ],
  templateUrl: './gestione-dipendenti.html',
  styleUrls: ['./gestione-dipendenti.scss']
})
export class GestioneDipendentiComponent implements OnInit {

  dipendenti: Dipendente[] = [];
  showForm = false;
  loading = false;
  nomeUtente = '';
  hidePassword = true;

  reparti = [
    { value: 'ADDETTI_SERVIZI', label: 'Addetti ai Servizi', breve: 'Servizi',   icona: 'cleaning_services' },
    { value: 'CASSA',           label: 'Cassa',              breve: 'Cassa',     icona: 'point_of_sale' },
    { value: 'MECCANICO',       label: 'Meccanico',          breve: 'Meccanico', icona: 'build' }
  ];

  links: LinkNavigazione[] = [
    { label: 'Turni',      route: '/dashboard',  icona: 'calendar_month' },
    { label: 'Dipendenti', route: '/dipendenti', icona: 'group' }
  ];

  vociMenu: VoceMenu[] = [
    { id: 'profilo', label: 'Il mio profilo', icona: 'manage_accounts' },
    { id: 'esci',    label: 'Esci',           icona: 'logout' }
  ];

  // Filtri della lista
  ricerca = '';
  filtroReparto = '';

  registrazioneForm: FormGroup;

  constructor(
    private dipendentiService: DipendentiService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {
    this.registrazioneForm = this.fb.group({
      nome:     ['', Validators.required],
      cognome:  ['', Validators.required],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      telefono: [''],
      reparto:  ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.nomeUtente = this.authService.getCurrentUser()?.nome || '';
    this.caricaDipendenti();
  }

  caricaDipendenti(): void {
    this.dipendentiService.getTutti().subscribe({
      next: (data) => {
        this.dipendenti = data;
        this.cdr.detectChanges();
      },
      error: () => this.mostraErrore('Errore nel caricamento dipendenti')
    });
  }

  registraDipendente(): void {
    if (this.registrazioneForm.invalid) return;
    this.loading = true;

    const formValue = { ...this.registrazioneForm.value };

    // Se in modifica e password vuota, rimuovila dal payload
    if (this.dipendenteInModifica && !formValue.password) {
      delete formValue.password;
    }

    if (this.dipendenteInModifica) {
      this.dipendentiService.modifica(this.dipendenteInModifica.id, formValue).subscribe({
        next: () => {
          this.mostraSuccesso('Dipendente modificato con successo!');
          this.chiudiForm();
          this.caricaDipendenti();
          this.loading = false;
        },
        error: (err) => {
          this.mostraErrore(err.error?.messaggio || 'Errore nella modifica');
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.dipendentiService.registra(formValue).subscribe({
        next: () => {
          this.mostraSuccesso('Dipendente registrato con successo!');
          this.chiudiForm();
          this.caricaDipendenti();
          this.loading = false;
        },
        error: (err) => {
          this.mostraErrore(err.error?.messaggio || 'Errore nella registrazione');
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  dipendenteInModifica: Dipendente | null = null;

  apriFormModifica(dipendente: Dipendente): void {
    this.dipendenteInModifica = dipendente;
    
    // Rimuovi il validator required dalla password in modifica
    this.registrazioneForm.get('password')?.clearValidators();
    this.registrazioneForm.get('password')?.setValidators(Validators.minLength(6));
    this.registrazioneForm.get('password')?.updateValueAndValidity();

    this.registrazioneForm.patchValue({
      nome:     dipendente.nome,
      cognome:  dipendente.cognome,
      email:    dipendente.email,
      telefono: dipendente.telefono,
      reparto:  dipendente.reparto,
      password: ''
    });
    this.showForm = true;
}

  eliminaDipendente(id: number): void {
    const dialogRef = this.dialog.open(ConfermaDialogComponent, {
      //width: '480px',
      data: { messaggio: 'Sei sicuro di voler eliminare questo dipendente? Ricorda che la cancellazione sarà definitiva.' }
    });

    dialogRef.afterClosed().subscribe(confermato => {
      if (!confermato) return;
      this.dipendentiService.elimina(id).subscribe({
        next: () => {
          this.mostraSuccesso('Dipendente eliminato con successo');
          this.caricaDipendenti();
        },
        error: () => this.mostraErrore('Errore durante l\'eliminazione')
      });
    });
  }

  chiudiForm(): void {
    this.showForm = false;
    this.dipendenteInModifica = null;
    
    // Ripristina il validator required per la password
    this.registrazioneForm.get('password')?.setValidators([
      Validators.required,
      Validators.minLength(6)
    ]);
    this.registrazioneForm.get('password')?.updateValueAndValidity();
    this.registrazioneForm.reset();
  }

  getRepartoLabel(reparto: string): string {
    return this.reparti.find(r => r.value === reparto)?.label || reparto;
  }

  getIniziali(d: Dipendente): string {
    return `${d.nome?.[0] ?? ''}${d.cognome?.[0] ?? ''}`.toUpperCase();
  }

  contaPerReparto(reparto: string): number {
    return this.dipendenti.filter(d => d.reparto === reparto).length;
  }

  dipendentiFiltrati(): Dipendente[] {
    const testo = this.ricerca.trim().toLowerCase();
    return this.dipendenti.filter(d =>
      (!this.filtroReparto || d.reparto === this.filtroReparto) &&
      (!testo || `${d.nome} ${d.cognome} ${d.email}`.toLowerCase().includes(testo)));
  }

  apriFormNuovo(): void {
    this.dipendenteInModifica = null;
    this.showForm = true;
  }

  onVoceMenu(id: string): void {
    if (id === 'profilo') this.apriProfiloAdmin();
    if (id === 'esci') this.logout();
  }

  apriProfiloAdmin(): void {
    this.dialog.open(ProfiloAdminDialogComponent, {
      width: '95vw',
      maxWidth: '500px',
      maxHeight: '90vh',
    });
  }

  logout(): void {
    this.authService.logout();
  }

  private mostraSuccesso(msg: string): void {
    this.snackBar.open(msg, 'OK', { duration: 3000 });
  }

  private mostraErrore(msg: string): void {
    this.snackBar.open(msg, 'OK', { duration: 4000 });
  }
}