import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, of } from 'rxjs';

import { Item } from '../interfaces/item';

@Injectable({
  providedIn: 'root'
})
export class IngredientService {
  private api = 'http://localhost:3000/ingredients';
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

  purgeItem(item: Item) {
    return this.http.put(`${this.api}/purge-item`, item, this.httpOptions).pipe(
      catchError(err => of(err))
    );
  };
}
