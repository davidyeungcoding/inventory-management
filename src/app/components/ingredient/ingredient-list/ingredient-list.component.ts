import { Component, OnDestroy, OnInit } from '@angular/core';

import { IngredientService } from 'src/app/services/ingredient.service';

import { Ingredient } from 'src/app/interfaces/ingredient';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ingredient-list',
  templateUrl: './ingredient-list.component.html',
  styleUrls: ['./ingredient-list.component.css']
})
export class IngredientListComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  ingredientList: Ingredient[] = [];

  constructor(
    private ingredientService: IngredientService
  ) { }

  ngOnInit(): void {
    this.retrieveIngredientList();
    this.subscriptions.add(this.ingredientService.ingredientList.subscribe(_list => this.ingredientList = _list));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // =======================
  // || General Functions ||
  // =======================

  retrieveIngredientList(): void {
    this.ingredientService.getIngredientList().subscribe(_list => {
      this.ingredientService.changeIngredientList(_list.msg);
    });
  };

  onTargetIngredient(ingredient: Ingredient): void {
    console.log(ingredient)
  };

  onBack(): void {
    console.log('back')
  }
}
