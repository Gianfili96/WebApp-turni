import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cambio-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './cambio-password.html',
  styleUrls: ['./cambio-password.scss']
})
export class CambioPasswordComponent implements OnInit {

  form: FormGroup;
  loading = false;
  hidePasswordAttuale = true;
  hideNuovaPassword = true;
  hideConfermaPassword = true;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      email:            ['', [Validators.required, Validators.email]],
      passwordAttuale:  ['', Validators.required],
      nuovaPassword:    ['', [Validators.required, Validators.minLength(6)]],
      confermaPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {}

  passwordMatchValidator(form: FormGroup) {
    const nuova = form.get('nuovaPassword')?.value;
    const conferma = form.get('confermaPassword')?.value;
    return nuova === conferma ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;

    this.http.post(`${environment.apiUrl}/cambio-password-primo-accesso`, this.form.value)
      .subscribe({
        next: () => {
          this.loading = false;
          this.snackBar.open('Password cambiata con successo! Ora puoi accedere.', 'OK', { duration: 4000 });
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.loading = false;
          this.snackBar.open(err.error?.messaggio || 'Errore nel cambio password', 'OK', { duration: 4000 });
        }
      });
  }
}
