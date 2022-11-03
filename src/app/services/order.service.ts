import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, of } from 'rxjs';

import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private api = 'http://localhost:3000/orders';

  constructor(
    private globalService: GlobalService,
    private http: HttpClient
  ) { }

  // =====================
  // || Router Requests ||
  // =====================

  createOrder(token: string, payload: any) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.post(`${this.api}/create`, payload, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  searchByDate(token: string, payload: any) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.get(`${this.api}/search-date/${payload.storeId}/${payload.date}`, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  searchByDateAndStore(token: string, payload: any) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.put(`${this.api}/search-date-store`, payload, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  // =======================
  // || General Functions ||
  // =======================

  parseDateForDisplay(date: any): string {
    const temp = date.toString().split(' ');
    const hour = Number(temp[4].substring(0, 2));
    const modifier = hour < 12 ? 'AM' : 'PM';
    temp[4] = hour === 0 ? `12${temp[4].substring(2)}`
    : hour > 12 ? `${hour - 12}${temp[4].substring(2)}`
    : temp[4];
    return `${temp[0]}. ${temp[1]} ${temp[2]}, ${temp[3]} ${temp[4]} ${modifier}`;
  };

  sortDate(list: string[]): string[] {
    // sort by year => month => day => hour => min
  };
}
