import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, of } from 'rxjs';

import { GlobalService } from './global.service';

import { Item } from '../interfaces/item';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private api = 'http://localhost:3000/items';
  
  // =====================
  // || Fixed Variables ||
  // =====================

  private nameErrorSource = new BehaviorSubject<string>('Name may not contain special characters');
  nameError = this.nameErrorSource.asObservable();
  private priceErrorSource = new BehaviorSubject<string>('No more than two digits past the decimal point');
  priceError = this.priceErrorSource.asObservable();

  // =================
  // || Observables ||
  // =================

  private itemListSource = new BehaviorSubject<Item[]>([]);
  itemList = this.itemListSource.asObservable();

  constructor(
    private globalService: GlobalService,
    private http: HttpClient
  ) { }
  
  // =====================
  // || Router Requests ||
  // =====================

  getFullItemList(token: string, storeId: string) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.get(`${this.api}/search/${storeId}`, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  createItem(item: any, token: string) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.post(`${this.api}/create`, item, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  editItemDetails(payload: any, token: string) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.put(`${this.api}/edit-item-details`, payload, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  updateItemIngredient(payload: any, token: string) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.put(`${this.api}/edit-item-ingredients`, payload, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  deleteItem(item: Item, token: string) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.put(`${this.api}/delete`, item, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  // ======================
  // || Shared Functions ||
  // ======================

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

  // =======================
  // || Change Observables||
  // =======================

  changeItemList(list: Item[]): void {
    this.itemListSource.next(list);
  };
}
