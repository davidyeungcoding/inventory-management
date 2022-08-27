import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { IngredientService } from 'src/app/services/ingredient.service';
import { GlobalService } from 'src/app/services/global.service';
import { UserService } from 'src/app/services/user.service';

import { Ingredient } from 'src/app/interfaces/ingredient';

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
    private ingredientService: IngredientService,
    private globalService: GlobalService,
    private userService: UserService
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
    const token = localStorage.getItem('token');
    if (!token) return this.userService.logout();
    const storeId = document.URL.substring(document.URL.lastIndexOf('/') + 1);

    this.ingredientService.getIngredientList(token, storeId).subscribe(_list => {
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

  onAddIngredient(): void {
    $('#addIngredientMsgContainer').css('display', 'none');
  };

  onBack(): void {
    this.globalService.redirectUser('store-list');
  };
}
