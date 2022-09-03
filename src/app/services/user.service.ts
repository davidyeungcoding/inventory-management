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
    private globalService: GlobalService,
    private http: HttpClient
  ) { }

  // =================
  // || Observables ||
  // =================

  private homeMessageSource = new BehaviorSubject<string>('');
  homeMessage = this.homeMessageSource.asObservable();
  private activeUserSource = new BehaviorSubject<User|null>(null);
  activeUser = this.activeUserSource.asObservable();
  private storeUsersSource = new BehaviorSubject<User[]>([]);
  storeUsers = this.storeUsersSource.asObservable();
  private fullUserListSource = new BehaviorSubject<User[]>([]);
  fullUserList = this.fullUserListSource.asObservable();
  private toChangeSource = new BehaviorSubject<any>({});
  toChange = this.toChangeSource.asObservable();
  private accountTypeSource = new BehaviorSubject<any>({});
  accountType = this.accountTypeSource.asObservable();

  // =====================
  // || Router Requests ||
  // =====================

  createUser(form: any) {
    return this.http.post(`${this.api}/create`, form, this.httpOptions).pipe(
      catchError(err => of(err))
    );
  };

  updateAccountType(form: any, token: string) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.put(`${this.api}/change-account-type`, form, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  loginUser(form: any) {
    return this.http.post(`${this.api}/login`, form, this.httpOptions).pipe(
      catchError(err => of(err))
    );
  };

  retrieveUserData(token: string) {
    const validateHeader =this.globalService.buildValidateHeaders(token);

    return this.http.get(`${this.api}/retrieve-user`, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  logoutFromDB(token: string) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.get(`${this.api}/logout`, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  getStoreUsers(token: string, storeId: string) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.get(`${this.api}/store-users/${storeId}`, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  getFullUserList(token: string) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.get(`${this.api}/full-user-list`, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  // =======================
  // || General Functions ||
  // =======================

  logout(): void {
    const token = localStorage.getItem('token');
    if (!token) return this.globalService.redirectUser('home');

    this.logoutFromDB(token).subscribe(_res => {
      if (_res.status === 200) {
        this.changeActiveUser(null);
        this.changeAccountType('general');
        localStorage.removeItem('token');
        this.globalService.redirectUser('home');
      } else {
        // to do: failure to logout
      };
    });
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

  changeStoreUsers(list: User[]): void {
    list.sort((a, b) => {
      return a.username.toLowerCase() < b.username.toLowerCase() ? -1
      : a.username.toLowerCase() > b.username.toLowerCase() ? 1
      : 0;
    });

    this.storeUsersSource.next(list);
  };

  changeFullUserList(list: User[]): void {
    this.fullUserListSource.next(list);
  };

  changeToChange(obj: any): void {
    this.toChangeSource.next(obj);
  };

  changeAccountType(type: string): void {
    const temp = {
      admin: false,
      manager: false
    };

    switch (type) {
      case 'admin':
        temp.admin = true;
        temp.manager = true;
        break;
      case 'manager':
        temp.admin = false;
        temp.manager = true;
        break;
      default:
        temp.admin = false;
        temp.manager = false;
    };

    this.accountTypeSource.next(temp);
  };
}
