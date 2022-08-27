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
  addMessage: string = '';
  addIngredient = new FormGroup({
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
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ======================
  // || Helper Functions ||
  // ======================

  clearForm(): void {
    this.addIngredient.setValue({
      name: '',
      storeId: ''
    });
  };

  validateName(name: any): boolean {
    const check = this.globalService.testName(name);

    if(!check) {
      this.addMessage = 'Please enter a valid item name. Name may not include special characters.';
      this.globalService.displayMsg('alert-danger', '#addIngredientMsg', '#addIngredientMsgContainer');
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
    $('#addIngredientMsgContainer').css('display', 'none');
    const form = this.addIngredient.value;
    if (!this.validateName(form.name)) return;
    $('#createIngredientBtn').prop('disabled', true);
    const token = localStorage.getItem('token');
    if (!token) return this.userService.logout();
    form.storeId = document.URL.substring(document.URL.lastIndexOf('/') + 1);

    this.ingredientService.createIngredient(form, token).subscribe(_ingredient => {
      if (_ingredient.status === 201) {
        this.addMessage = 'Ingredient successfully created';
        this.globalService.displayMsg('alert-success', '#addIngredientMsg', '#addIngredientMsgContainer');
        this.addIngredientToList(_ingredient.msg);

        setTimeout(() => {
          (<any>$('#createIngredientModal')).modal('hide');
          this.clearForm();
          $('#createIngredientBtn').prop('disabled', false);
          $('#addIngredientMsgContainer').css('display', 'none');
        }, 1500);
      } else {
        this.addMessage = _ingredient.msg;
        this.globalService.displayMsg('alert-danger', '#addIngredientMsg', '#addIngredientMsgContainer');
        $('#createIngredientBtn').prop('disabled', false);
      };
    });
  };

  onCancelCreate(): void {
    this.clearForm();
    (<any>$('#createIngredientModal')).modal('hide');
    $('#createIngredientBtn').prop('disabled', false);
    $('#addIngredientMsgContainer').css('display', 'none');
  };
}
