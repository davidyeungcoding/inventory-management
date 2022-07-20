import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private api = 'http://localhost:3000/items';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(
    private http: HttpClient
  ) { }
  
  // =====================
  // || Router Requests ||
  // =====================

  getFullItemList() {
    return this.http.get(`${this.api}/search?query=name`, this.httpOptions).pipe(
      catchError(err => of(err))
    );
  };
}
