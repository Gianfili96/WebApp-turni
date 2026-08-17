import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dipendente } from '../../models/turno.model';

@Injectable({
  providedIn: 'root'
})
export class DipendentiService {

  private readonly API_URL = 'http://192.168.1.174:8080/api/dipendenti';

  constructor(private http: HttpClient) {}

  getTutti(): Observable<Dipendente[]> {
    return this.http.get<Dipendente[]>(this.API_URL);
  }

  getById(id: number): Observable<Dipendente> {
    return this.http.get<Dipendente>(`${this.API_URL}/${id}`);
  }
}