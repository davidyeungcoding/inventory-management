import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private api = 'http://localhost:3000/users';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(
    private http: HttpClient
  ) { }

  // =================
  // || Observables ||
  // =================

  private homeMessageSource = new BehaviorSubject<string>('');
  homeMessage = this.homeMessageSource.asObservable();

  // =====================
  // || Router Requests ||
  // =====================

  createUser(form: any) {
    return this.http.post(`${this.api}/create`, form, this.httpOptions).pipe(
      catchError(err => of(err))
    );
  };

  // ========================
  // || Change Observables ||
  // ========================

  changeHomeMessage(msg: string): void {
    this.homeMessageSource.next(msg);
  };
}
