import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, of } from 'rxjs';

import { GlobalService } from './global.service';

import { Store } from '../interfaces/store';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  // private api = 'http://localhost:3000/stores'; // dev
  private api = 'stores'; // production

  constructor(
    private globalService: GlobalService,
    private http: HttpClient
  ) { }

  // =================
  // || Observables ||
  // =================

  private storeListSource = new BehaviorSubject<Store[]>([]);
  storeList = this.storeListSource.asObservable();
  private selectedStateSource = new BehaviorSubject<string>('');
  selectedState = this.selectedStateSource.asObservable();

  // =====================
  // || Router Requests ||
  // =====================

  createStore(token: string, payload: any) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.post(`${this.api}/create`, payload, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  getStoreList(token: string) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.get(`${this.api}/search`, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  getStoreDetails(token: string, storeId: string) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.get(`${this.api}/details/${storeId}`, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  updateStoreUsers(token: string, payload: any) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.put(`${this.api}/edit-users`, payload, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  updateStoreDetails(token: string, payload: any) {
    const validateHeader = this.globalService.buildValidateHeaders(token);
    
    return this.http.put(`${this.api}/edit-details`, payload, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  searchStore(token: string, term: string) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.get(`${this.api}/search?term=${term}`, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  deleteStore(token: string, payload: any) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.put(`${this.api}/delete`, payload, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  // ==========================
  // || Change Observerables ||
  // ==========================

  changeStoreList(list: Store[]): void {
    list.sort((a, b) => {
      return a.name.toLowerCase() < b.name.toLowerCase() ? -1
      : a.name.toLowerCase() > b.name.toLowerCase() ? 1
      : 0;
    });

    this.storeListSource.next(list);
  };

  changeSelectedState(state: string): void {
    this.selectedStateSource.next(state);
  };
}
