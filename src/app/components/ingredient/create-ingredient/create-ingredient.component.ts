import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { IngredientService } from 'src/app/services/ingredient.service';
import { GlobalService } from 'src/app/services/global.service';
import { UserService } from 'src/app/services/user.service';

import { Ingredient } from 'src/app/interfaces/ingredient';

@Component({
  selector: 'app-create-ingredient',
  templateUrl: './create-ingredient.component.html',
  styleUrls: ['./create-ingredient.component.css']
})
export class CreateIngredientComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  ingredientList: Ingredient[] = [];
  createMessage?: string;
  createIngredient = new FormGroup({
    name: new FormControl(''),
    storeId: new FormControl('')
  });

  constructor(
    private ingredientService: IngredientService,
    private globalService: GlobalService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.ingredientService.ingredientList.subscribe(_list => this.ingredientList = _list));
    this.subscriptions.add(this.userService.systemMsg.subscribe(_msg => this.createMessage = _msg));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ======================
  // || Helper Functions ||
  // ======================

  clearForm(): void {
    this.createIngredient.setValue({
      name: '',
      storeId: ''
    });
  };

  validateName(name: any): boolean {
    const check = this.globalService.testName(name);

    if(!check) {
      this.userService.changeSystemMsg('Please enter a valid item name. Name may not include special characters.');
      this.globalService.displayMsg('alert-danger', '#createIngredientMsg');
      $('#createIngredientBtn').prop('disabled', false);
    };

    return check;
  };

  addIngredientToList(ingredient: Ingredient): void {
    let list = [...this.ingredientList];
    list.push(ingredient);
    this.ingredientService.changeIngredientList(list);
  };

  // =======================
  // || General Functions ||
  // =======================

  onCreateIngredient(): void {
    $('#createIngredientMsgContainer').css('display', 'none');
    $('#createIngredientBtn').prop('disabled', true);
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingTokenModal('#createIngredientMsg', '#createIngredientModal');
    const form = this.createIngredient.value;
    form.storeId = document.URL.substring(document.URL.lastIndexOf('/') + 1);
    if (!this.validateName(form.name)) return;

    this.ingredientService.createIngredient(form, token).subscribe(_ingredient => {
      if (_ingredient.status === 201) {
        if (_ingredient.token) localStorage.setItem('token', _ingredient.token);
        this.userService.changeSystemMsg('Ingredient successfully created');
        this.globalService.displayMsg('alert-success', '#createIngredientMsg');
        this.addIngredientToList(_ingredient.msg);

        setTimeout(() => {
          (<any>$('#createIngredientModal')).modal('hide');
          this.clearForm();
        }, this.globalService.timeout);
      } else {
        this.userService.changeSystemMsg(_ingredient.msg);
        this.globalService.displayMsg('alert-danger', '#createIngredientMsg');
        $('#createIngredientBtn').prop('disabled', false);
      };
    });
  };

  onCancelCreate(): void {
    (<any>$('#createIngredientModal')).modal('hide');
    this.clearForm();
  };
}
