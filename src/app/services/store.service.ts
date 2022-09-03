import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, of } from 'rxjs';

import { GlobalService } from './global.service';

import { Store } from '../interfaces/store';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private api = 'http://localhost:3000/stores';

  constructor(
    private globalService: GlobalService,
    private http: HttpClient
  ) { }

  // =================
  // || Observables ||
  // =================

  private storeListSource = new BehaviorSubject<Store[]>([]);
  storeList = this.storeListSource.asObservable();

  // =====================
  // || Router Requests ||
  // =====================

  getStoreList(token: string) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.get(`${this.api}/search`, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  updateStoreUsers(token: string, payload: any) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.put(`${this.api}/edit-users`, payload, validateHeader).pipe(
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
}
