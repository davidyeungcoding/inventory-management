import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, of } from 'rxjs';

import { GlobalService } from './global.service';

import { User } from '../interfaces/user';

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
    private http: HttpClient,
    private globalService: GlobalService
  ) { }

  // =================
  // || Observables ||
  // =================

  private homeMessageSource = new BehaviorSubject<string>('');
  homeMessage = this.homeMessageSource.asObservable();
  private activeUserSource = new BehaviorSubject<User|null>(null);
  activeUser = this.activeUserSource.asObservable();

  // =====================
  // || Router Requests ||
  // =====================

  createUser(form: any) {
    return this.http.post(`${this.api}/create`, form, this.httpOptions).pipe(
      catchError(err => of(err))
    );
  };

  loginUser(form: any) {
    return this.http.post(`${this.api}/login`, form, this.httpOptions).pipe(
      catchError(err => of(err))
    );
  };

  retrieveUserData(token: string) {
    const validateHeader = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': token
      })
    };

    return this.http.get(`${this.api}/retrieve-user`, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  // =======================
  // || General Functions ||
  // =======================

  logout(): void {
    this.changeActiveUser(null);
    localStorage.removeItem('token');
    this.globalService.redirectUser('home');
  };

  // ========================
  // || Change Observables ||
  // ========================

  changeHomeMessage(msg: string): void {
    this.homeMessageSource.next(msg);
  };

  changeActiveUser(user: User|null): void {
    this.activeUserSource.next(user);
  };
}
