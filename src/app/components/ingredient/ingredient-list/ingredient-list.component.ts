import { Component, OnDestroy, OnInit } from '@angular/core';

import { IngredientService } from 'src/app/services/ingredient.service';

import { Ingredient } from 'src/app/interfaces/ingredient';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-ingredient-list',
  templateUrl: './ingredient-list.component.html',
  styleUrls: ['./ingredient-list.component.css']
})
export class IngredientListComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  ingredientList: Ingredient[] = [];
  targetIngredient: Ingredient|null = null;
  editIngredientForm = new FormGroup({
    name: new FormControl('')
  });

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

  // ======================
  // || Helper Functions ||
  // ======================

  onTargetIngredient(ingredient: Ingredient): void {
    this.targetIngredient = ingredient;
  };

  // =======================
  // || General Functions ||
  // =======================

  retrieveIngredientList(): void {
    this.ingredientService.getIngredientList().subscribe(_list => {
      this.ingredientService.changeIngredientList(_list.msg);
    });
  };

  onEditIngredient(ingredient: Ingredient): void {
    this.onTargetIngredient(ingredient);
    $('#editIngredientBtn').prop('disabled', false);
    $('#editIngredientName').attr('placeholder', this.targetIngredient!.name);
    this.editIngredientForm.setValue({
      name: ''
    });
  };

  onDeleteIngredient(ingredient: Ingredient): void {
    this.onTargetIngredient(ingredient);
  };

  onBack(): void {
    console.log('back')
  }
}
