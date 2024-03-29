import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, of } from 'rxjs';

import { GlobalService } from './global.service';

import { Ingredient } from '../interfaces/ingredient';

@Injectable({
  providedIn: 'root'
})
export class IngredientService {
  // private api = 'http://localhost:3000/ingredients'; // dev
  private api = 'ingredients'; // production

  // =====================
  // || Fixed Variables ||
  // =====================

  private nameErrorSource = new BehaviorSubject<string>('Name may not include special characters');
  nameError = this.nameErrorSource.asObservable();

  // =================
  // || Observables ||
  // =================

  private ingredientListSource = new BehaviorSubject<Ingredient[]> ([]);
  ingredientList = this.ingredientListSource.asObservable();

  constructor(
    private globalService: GlobalService,
    private http: HttpClient
  ) { }

  // =====================
  // || Router Requests ||
  // =====================

  getIngredientList(token: string, storeId: string) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.get(`${this.api}/search/${storeId}`, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  createIngredient(ingredient: any, token: string) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.post(`${this.api}/create`, ingredient, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  editIngredient(ingredient: any, token: string) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.put(`${this.api}/edit`, ingredient, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  deleteIngredient(ingredient: Ingredient, token: string) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.put(`${this.api}/delete`, ingredient, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  // =======================
  // || Change Observable ||
  // =======================

  changeIngredientList(list: Ingredient[]): void {
    this.ingredientListSource.next(list);
  };
}
