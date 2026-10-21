import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const snackBar = inject(MatSnackBar);
  const token = authService.getToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      // Token scaduto o non più valido: torna al login.
      // Solo se la richiesta aveva un token, così il login fallito non viene intercettato.
      if (err.status === 401 && token) {
        authService.logout();
        snackBar.open('Sessione scaduta, effettua di nuovo l\'accesso.', 'OK', { duration: 4000 });
      }
      return throwError(() => err);
    })
  );
};
