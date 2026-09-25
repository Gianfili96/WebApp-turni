import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { DipendentiService } from '../../core/services/dipendenti.service';
import { AuthService } from '../../core/services/auth.service';
import { Dipendente } from '../../models/turno.model';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfermaDialogComponent } from '../../shared/components/conferma-dialog/conferma-dialog';

@Component({
  selector: 'app-gestione-dipendenti',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatDialogModule
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
    { value: 'ADDETTI_SERVIZI',   label: 'Addetti ai Servizi' },
    { value: 'CASSA',     label: 'Cassa' },
    { value: 'MECCANICO', label: 'Meccanico' }
  ];

  registrazioneForm: FormGroup;

  constructor(
    private dipendentiService: DipendentiService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
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

  getRepartoColore(reparto: string): string {
    switch(reparto) {
      case 'PULIZIE':   return '#3f51b5';
      case 'CASSA':     return '#4caf50';
      case 'MECCANICO': return '#ff9800';
      default:          return '#666';
    }
  }

  tornaAllaDashboard(): void {
    this.router.navigate(['/dashboard']);
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