import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';
import { DipendentiService } from '../../../core/services/dipendenti.service';
import { Dipendente } from '../../../models/turno.model';

@Component({
  selector: 'app-profilo-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './profilo-dialog.html',
  styleUrls: ['./profilo-dialog.scss']
})
export class ProfiloDialogComponent implements OnInit {

  dipendente: Dipendente | null = null;
  nomeUtente = '';

  reparti: { [key: string]: string } = {
    'ADDETTI_SERVIZI': 'Addetti ai Servizi',
    'CASSA': 'Cassa',
    'MECCANICO': 'Meccanico'
  };

  constructor(
    private authService: AuthService,
    private dipendentiService: DipendentiService,
    public dialogRef: MatDialogRef<ProfiloDialogComponent>,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
  const user = this.authService.getCurrentUser();
  this.nomeUtente = user?.nome || '';

  if (user?.dipendenteId) {
    this.dipendentiService.getById(user.dipendenteId).subscribe({
      next: (data) => {
        this.dipendente = data;
        this.cdr.detectChanges();  // ← aggiungi
      },
      error: () => console.error('Errore nel caricamento profilo')
    });
  }
}

  getRepartoLabel(reparto: string): string {
    return this.reparti[reparto] || reparto;
  }

  getAvatarLetters(): string {
    if (!this.dipendente) return '?';
    return `${this.dipendente.nome[0]}${this.dipendente.cognome[0]}`.toUpperCase();
  }

  chiudi(): void {
    this.dialogRef.close();
  }
}