import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-cambio-password-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './cambio-password-dialog.html',
  styleUrls: ['./cambio-password-dialog.scss']
})
export class CambioPasswordDialogComponent {

  form: FormGroup;
  loading = false;
  hidePasswordAttuale = true;
  hideNuovaPassword = true;
  hideConfermaPassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dialogRef: MatDialogRef<CambioPasswordDialogComponent>,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      passwordAttuale:  ['', Validators.required],
      nuovaPassword:    ['', [Validators.required, Validators.minLength(6)]],
      confermaPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const nuova = form.get('nuovaPassword')?.value;
    const conferma = form.get('confermaPassword')?.value;
    return nuova === conferma ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.cdr.detectChanges();

    this.authService.cambiaPassword(this.form.value).subscribe({
      next: () => {
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open('Password cambiata con successo!', 'OK', { duration: 3000 });
        this.dialogRef.close();
      },
      error: (err) => {
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open(err.error?.messaggio || 'Errore nel cambio password', 'OK', { duration: 4000 });
      }
    });
  }

  annulla(): void {
    this.dialogRef.close();
  }
}