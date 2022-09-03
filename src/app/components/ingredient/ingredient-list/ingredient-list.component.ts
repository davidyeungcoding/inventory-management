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
  targetIngredient: Ingredient|null = null;
  ingredientList: Ingredient[] = [];
  errorMessage: string = '';
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
    this.ingredientService.changeIngredientList([]);
    this.subscriptions.unsubscribe();
  }

  // =====================
  // || Helper Functins ||
  // =====================

  handleMissingToken(): void {
    this.errorMessage = this.globalService.missingTokenMsg;
    this.globalService.displayMsg('alert-danger', '#ingredientListMsg');
    setTimeout(() => { this.userService.logout() }, this.globalService.timeoutLong);
  };

  // =======================
  // || General Functions ||
  // =======================

  retrieveIngredientList(): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.logout();
    const storeId = document.URL.substring(document.URL.lastIndexOf('/') + 1);

    this.ingredientService.getIngredientList(token, storeId).subscribe(_list => {
      if (_list.status === 200) {
        if (_list.token) localStorage.setItem('token', _list.token);
        this.ingredientService.changeIngredientList(_list.msg);
      } else {
        this.errorMessage = _list.msg;
        this.globalService.displayMsg('alert-danger', '#ingredientListMsg');
      };
    });
  };

  onEditIngredient(ingredient: Ingredient): void {
    const token = localStorage.getItem('token');
    if (!token) return this.handleMissingToken();
    this.targetIngredient = ingredient;
    $('#editIngredientBtn').prop('disabled', false);
    $('#editIngredientMsgContainer').css('display', 'none');
    $('#editIngredientName').attr('placeholder', this.targetIngredient.name);
    
    this.editIngredientForm.setValue({
      name: ''
    });

    (<any>$('#editIngredientModal')).modal('show');
  };

  onDeleteIngredient(ingredient: Ingredient): void {
    const token = localStorage.getItem('token');
    if (!token) return this.handleMissingToken();
    this.targetIngredient = ingredient;
    $('#deleteIngredientBtn').prop('disabled', false);
    $('#deleteIngredientMsgContainer').css('display', 'none');
    (<any>$('#deleteIngredientModal')).modal('show');
  };

  onCreateIngredient(): void {
    const token = localStorage.getItem('token');
    if (!token) return this.handleMissingToken();
    $('#createIngredientBtn').prop('disabled', false);
    $('#addIngredientMsgContainer').css('display', 'none');
    (<any>$('#createIngredientModal')).modal('show');
  };

  onBack(): void {
    this.globalService.redirectUser('store-list');
  };
}
