import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
  private nameSort: boolean = true;
  targetIngredient: Ingredient|null = null;
  ingredientList: Ingredient[] = [];
  errorMessage: string = '';
  editIngredientForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.pattern('^[\\w\\s]+$')])
  });
  createIngredientForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.pattern('^[\\w\\s]+$')]),
    storeId: new FormControl('')
  });

  constructor(
    private ingredientService: IngredientService,
    private globalService: GlobalService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.retrieveIngredientList();
    this.subscriptions.add(this.ingredientService.ingredientList.subscribe(_list => this.ingredientList = _list));
    this.subscriptions.add(this.userService.systemMsg.subscribe(_msg => this.errorMessage = _msg));
  }

  ngOnDestroy(): void {
    this.ingredientService.changeIngredientList([]);
    this.subscriptions.unsubscribe();
  }

  // ======================
  // || Helper Functions ||
  // ======================

  resetEditIngredient(): void {
    this.editIngredientForm.setValue({
      name: ''
    });

    $('#editIngredientName').attr('placeholder', this.targetIngredient!.name);
    this.editIngredientForm.markAsPristine();
    this.editIngredientForm.markAsUntouched();
  };

  resetCreateIngredientForm(): void {
    this.createIngredientForm.setValue({
      name: '',
      storeId: ''
    });

    this.createIngredientForm.markAsPristine();
    this.createIngredientForm.markAsUntouched();
  };

  modalPrep(elemId: string): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#ingredientListMsg');
    $(`${elemId}Btn`).prop('disabled', false);
    $(`${elemId}MsgContainer`).css('display', 'none');
    (<any>$(`${elemId}Modal`)).modal('show');
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
        this.globalService.sortList(_list.msg, 'name');
        $('.skeleton-entry').css('display', 'none');
        this.ingredientService.changeIngredientList(_list.msg);
      } else {
        this.userService.changeSystemMsg(_list.msg);
        this.globalService.displayMsg('alert-danger', '#ingredientListMsg');
      };
    });
  };

  sortList(): void {
    if (!this.ingredientList.length) return;
    const temp = [...this.ingredientList];
    const current = this.nameSort ? 'ingredientListName' : 'ingredientListNameReverse';
    const next = this.nameSort ? 'ingredientListNameReverse' : 'ingredientListName';
    this.nameSort ? this.globalService.reverseSortList(temp, 'name')
    : this.globalService.sortList(temp, 'name');
    this.ingredientService.changeIngredientList(temp);
    $(`#${current}`).addClass('hide');
    $(`#${next}`).removeClass('hide');
    this.nameSort = !this.nameSort;
  };

  onEditIngredient(ingredient: Ingredient): void {
    this.targetIngredient = ingredient;
    this.resetEditIngredient();
    this.modalPrep('#editIngredient');
  };

  onDeleteIngredient(ingredient: Ingredient): void {
    this.targetIngredient = ingredient;
    this.modalPrep('#deleteIngredient');
  };

  onCreateIngredient(): void {
    this.resetCreateIngredientForm();
    this.modalPrep('#createIngredient');
  };

  onBack(): void {
    this.globalService.redirectUser('store-list');
  };
}
