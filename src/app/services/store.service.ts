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

  // ==========================
  // || Change Observerables ||
  // ==========================

  changeStoreList(list: Store[]): void {
    this.storeListSource.next(list);
  };
}
