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
  private toChangeSource = new BehaviorSubject<any>({});
  toChange = this.toChangeSource.asObservable();

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

  editItemDetails(payload: any) {
    return this.http.put(`${this.api}/edit-item-details`, payload, this.httpOptions).pipe(
      catchError(err => of(err))
    );
  };

  deleteItem(item: Item) {
    return this.http.put(`${this.api}/delete`, item, this.httpOptions).pipe(
      catchError(err => of(err))
    );
  };

  updateItemIngredient(payload: any) {
    return this.http.put(`${this.api}/edit-item-ingredients`, payload, this.httpOptions).pipe(
      catchError(err => of(err))
    );
  };

  // ======================
  // || Shared Functions ||
  // ======================

  testName(name: any): boolean {
    const regex = new RegExp('^[\\w\\s]+$', 'gm');
    return regex.test(name);
  };

  testPrice(price: any): boolean {
    const regex = new RegExp('^\\d*[.]{0,1}\\d{0,2}$');
    return regex.test(price);
  };

  parsePrice(price: string): string {
    const index = price.indexOf('.');
    const start = price.substring(0, index);
    const end = price.substring(index + 1);
    if (index < 0) return price.length > 0 ? `${price}00` : '000';
    if (index === price.length - 1) return price.length > 1 ? `${start}00` : '000';
    if (index === price.length - 2) return price.length > 2 ? `${start}${end}0` : `0${end}0`;
    return start.length ? `${start}${end}` : `0${end}`;
  };

  replaceItem(array: Item[], item: Item): Item[] {
    for (let i = 0; i < array.length; i++) {
      if (array[i]._id === item._id) {
        array[i] = item;
        break;
      };
    };

    return array;
  };

  clearHighlight(): void {
    $('.item-ingredient').removeClass('selected');
  };

  // =======================
  // || Change Observables||
  // =======================

  changeItemList(list: Item[]): void {
    this.itemListSource.next(list);
  };

  changeToChange(targets: any): void {
    this.toChangeSource.next(targets);
  };
}
