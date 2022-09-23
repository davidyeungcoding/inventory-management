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

  // =====================
  // || Fixed Variables ||
  // =====================

  private usernameErrorSource = new BehaviorSubject<string>('Username may not include speical characters');
  usernameError = this.usernameErrorSource.asObservable();
  private passwordErrorSource = new BehaviorSubject<string>('Password may not include speical characters');
  passwordError = this.passwordErrorSource.asObservable();
  private missingTokenMsg = 'User missing authorization credentials, logging out shortly.';
  private timeoutLong = 3500;

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
  private systemMsgSource = new BehaviorSubject<string>('');
  systemMsg = this.systemMsgSource.asObservable();

  // =====================
  // || Router Requests ||
  // =====================

  createUser(form: any) {
    return this.http.post(`${this.api}/create`, form, this.httpOptions).pipe(
      catchError(err => of(err))
    );
  };

  updateAccountType(token: string, form: any) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.put(`${this.api}/change-account-type`, form, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  editUserDetails(token: string, form: any) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.put(`${this.api}/edit-details`, form, validateHeader).pipe(
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

  getManageUserList(token: string) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.get(`${this.api}/manage-user-list`, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  getFullUserList(token: string) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.get(`${this.api}/full-user-list`, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  resetPassword(token: string, payload: any) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.put(`${this.api}/reset-password`, payload, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  searchUser(token: string, term: string) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.get(`${this.api}/search?term=${term}`, validateHeader).pipe(
      catchError(err => of(err))
    );
  };
  
  deleteUser(token: string, payload: any) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.put(`${this.api}/delete`, payload, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  // =======================
  // || General Functions ||
  // =======================

  logout(): void {
    this.changeActiveUser(null);
    this.changeAccountType('general');
    const token = localStorage.getItem('token');
    if (!token) return this.globalService.redirectUser('home');

    this.logoutFromDB(token).subscribe(_res => {
      if (_res.status === 200) {
        localStorage.removeItem('token');
        this.globalService.redirectUser('home');
      } else {
        // to do: failure to logout
      };
    });
  };

  handleMissingToken(messageId: string): void {
    this.changeSystemMsg(this.missingTokenMsg);
    this.globalService.displayMsg('alert-danger', messageId);
    setTimeout(() => { this.logout() }, this.timeoutLong);
  };
  
  handleMissingTokenModal(messageId: string, modal: string): void {
    this.changeSystemMsg(this.missingTokenMsg);
    this.globalService.displayMsg('alert-danger', messageId);

    setTimeout(() => {
      (<any>$(`${modal}`)).modal('hide');
      this.logout();
    }, this.timeoutLong);
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

  changeSystemMsg(message: string): void {
    this.systemMsgSource.next(message);
  };
}
