import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, of } from 'rxjs';

import { Item } from '../interfaces/item';
import { Ingredient } from '../interfaces/ingredient';

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

  // =================
  // || Observables ||
  // =================

  private ingredientListSource = new BehaviorSubject<Ingredient[]> ([]);
  ingredientList = this.ingredientListSource.asObservable();

  constructor(
    private http: HttpClient
  ) { }

  // =====================
  // || Router Requests ||
  // =====================

  getIngredientList() {
    return this.http.get(`${this.api}/search`, this.httpOptions).pipe(
      catchError(err => of(err))
    );
  };

  purgeItem(item: Item) {
    return this.http.put(`${this.api}/purge-item`, item, this.httpOptions).pipe(
      catchError(err => of(err))
    );
  };

  createIngredient(ingredient: any) {
    return this.http.post(`${this.api}/create`, ingredient, this.httpOptions).pipe(
      catchError(err => of(err))
    );
  };

  editIngredient(ingredient: any) {
    return this.http.put(`${this.api}/edit`, ingredient, this.httpOptions).pipe(
      catchError(err => of(err))
    );
  };

  deleteIngredient(ingredient: Ingredient) {
    return this.http.put(`${this.api}/delete`, ingredient, this.httpOptions).pipe(
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
