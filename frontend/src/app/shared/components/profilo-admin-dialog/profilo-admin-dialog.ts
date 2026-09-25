import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../../core/services/auth.service';
import { UserSession } from '../../../models/user.model';

@Component({
  selector: 'app-profilo-admin-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatTabsModule
  ],
  templateUrl: './profilo-admin-dialog.html',
  styleUrls: ['./profilo-admin-dialog.scss']
})
export class ProfiloAdminDialogComponent implements OnInit {

  utente: UserSession | null = null;
  passwordForm: FormGroup;
  loading = false;
  hidePasswordAttuale = true;
  hideNuovaPassword = true;
  hideConfermaPassword = true;

  constructor(
    private authService: AuthService,
    public dialogRef: MatDialogRef<ProfiloAdminDialogComponent>,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.passwordForm = this.fb.group({
      passwordAttuale:  ['', Validators.required],
      nuovaPassword:    ['', [Validators.required, Validators.minLength(6)]],
      confermaPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.utente = this.authService.getCurrentUser();
    this.cdr.detectChanges();
  }

  passwordMatchValidator(form: FormGroup) {
    const nuova = form.get('nuovaPassword')?.value;
    const conferma = form.get('confermaPassword')?.value;
    return nuova === conferma ? null : { passwordMismatch: true };
  }

  getAvatarLetters(): string {
    if (!this.utente) return '?';
    const parti = this.utente.nome.split(' ');
    return parti.length >= 2
      ? `${parti[0][0]}${parti[1][0]}`.toUpperCase()
      : this.utente.nome[0].toUpperCase();
  }

  cambiPassword(): void {
    if (this.passwordForm.invalid) return;
    this.loading = true;

    this.authService.cambiaPassword(this.passwordForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('Password cambiata con successo!', 'OK', { duration: 3000 });
        this.passwordForm.setValue({
          passwordAttuale: '',
          nuovaPassword: '',
          confermaPassword: ''
        });
        this.passwordForm.markAsUntouched();
        this.passwordForm.markAsPristine();
        Object.keys(this.passwordForm.controls).forEach(key => {
          this.passwordForm.get(key)?.setErrors(null);
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.messaggio || 'Errore nel cambio password', 'OK', { duration: 4000 });
        this.cdr.detectChanges();
      }
    });
  }

  chiudi(): void {
    this.dialogRef.close();
  }
}