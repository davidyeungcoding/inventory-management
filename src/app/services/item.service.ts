import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, of } from 'rxjs';

import { Item } from '../interfaces/item';

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

  // =================
  // || Observables ||
  // =================

  private itemListSource = new BehaviorSubject<Item[]>([]);
  itemList = this.itemListSource.asObservable();

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

  createItem(item: any) {
    return this.http.post(`${this.api}/create`, item, this.httpOptions).pipe(
      catchError(err => of(err))
    );
  };

  editItemDetails(item: Item) {
    return this.http.put(`${this.api}/edit-item-details`, item, this.httpOptions).pipe(
      catchError(err => of(err))
    );
  };

  deleteItem(item: Item) {
    return this.http.put(`${this.api}/delete`, item, this.httpOptions).pipe(
      catchError(err => of(err))
    );
  };

  // =======================
  // || Change Observables||
  // =======================

  changeItemList(list: Item[]): void {
    this.itemListSource.next(list);
  };
}
