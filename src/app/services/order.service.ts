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
}
