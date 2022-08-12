import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Ingredient } from 'src/app/interfaces/ingredient';

import { GlobalService } from 'src/app/services/global.service';
import { IngredientService } from 'src/app/services/ingredient.service';

@Component({
  selector: 'app-edit-ingredient',
  templateUrl: './edit-ingredient.component.html',
  styleUrls: ['./edit-ingredient.component.css']
})
export class EditIngredientComponent implements OnInit, OnDestroy {
  @Input() targetIngredient: Ingredient|null = null;
  @Input() editIngredient: any;
  private subscriptions = new Subscription();
  private ingredientList: Ingredient[] = [];
  editMessage: string = '';

  constructor(
    private ingredientService: IngredientService,
    private globalService: GlobalService
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
    this.editIngredient.setValue({
      name: ''
    });
  };

  addIngredientToList(ingredient: Ingredient): void {
    let list = [...this.ingredientList];
    list.push(ingredient);
    this.ingredientService.changeIngredientList(list);
  };

  validateName(name: any): boolean {
    const check = this.globalService.testName(name);

    if (!check) {
      this.editMessage = 'Please enter a valid item name. Name may not include special characters.';
      this.globalService.displayMsg('alert-danger', '#editIngredientMsg', '#editIngredientMsgContainer');
    };

    return check;
  };

  replaceIngredient(ingredient: Ingredient): void {
    let list = [...this.ingredientList];

    for (let i = 0; i < list.length; i++) {
      if (list[i]._id === ingredient._id) {
        list.splice(i, 1, ingredient);
        break;
      };
    };

    this.ingredientService.changeIngredientList(list);
  };

  // =======================
  // || General Functions ||
  // =======================

  onEditIngredient(): void {
    $('#editIngredientMsgContainer').css('display', 'none');
    $('#editIngredientBtn').prop('disabled', false);
    const form = this.editIngredient.value;
    if (!this.validateName(form.name)) return;
    $('#editIngredientBtn').prop('disabled', true);
    const payload = {
      id: this.targetIngredient!._id,
      update: {
        name: form.name
      }
    };

    this.ingredientService.editIngredient(payload).subscribe(_ingredient => {
      if (_ingredient.status === 200) {
        this.replaceIngredient(_ingredient.msg);
        this.editMessage = 'Ingredient successfully updated';
        this.globalService.displayMsg('alert-success', '#editIngredientMsg', '#editIngredientMsgContainer');
        
        setTimeout(() => {
          (<any>$('#editIngredientModal')).modal('hide');
          $('#editIngredientBtn').prop('disabled', false);
          $('#editIngredientMsgContainer').css('display', 'none');
        }, 1500);
      } else {
        this.editMessage = _ingredient.msg;
        this.globalService.displayMsg('alert-danger', '#editIngredientMsg', '#editIngredientMsgContainer');
        $('#editIngredientBtn').prop('disabled', false);
      };
    });
  };

  onCancelIngredientEdit(): void {
    (<any>$('#editIngredientModal')).modal('hide');
    this.clearForm();
    $('#editIngredientBtn').prop('disabled', false);
    $('#editIngredientMsgContainer').css('display', 'none');
  };
}
