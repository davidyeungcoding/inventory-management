import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { IngredientService } from 'src/app/services/ingredient.service';
import { GlobalService } from 'src/app/services/global.service';
import { UserService } from 'src/app/services/user.service';

import { Ingredient } from 'src/app/interfaces/ingredient';

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
      this.globalService.displayMsg('alert-danger', '#editIngredientMsg');
      $('#editIngredientBtn').prop('disabled', false);
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

  handleMissingToken(): void {
    this.editMessage = this.globalService.missingTokenMsg;
    this.globalService.displayMsg('alert-danger', '#editIngredientMsg');

    setTimeout(() => {
      (<any>$('#editIngredientModal')).modal('hide');
      this.userService.logout();
    }, this.globalService.timeoutLong);
  };

  // =======================
  // || General Functions ||
  // =======================

  onEditIngredient(): void {
    $('#editIngredientMsgContainer').css('display', 'none');
    $('#editIngredientBtn').prop('disabled', true);
    const token = localStorage.getItem('token');
    if (!token) return this.handleMissingToken();
    const form = this.editIngredient.value;
    if (!this.validateName(form.name)) return;

    const payload = {
      _id: this.targetIngredient!._id,
      update: {
        name: form.name
      }
    };

    this.ingredientService.editIngredient(payload, token).subscribe(_ingredient => {
      if (_ingredient.status === 200) {
        if (_ingredient.token) localStorage.setItem('token', _ingredient.token);
        this.editMessage = 'Ingredient successfully updated';
        this.globalService.displayMsg('alert-success', '#editIngredientMsg');
        this.replaceIngredient(_ingredient.msg);
        setTimeout(() => { (<any>$('#editIngredientModal')).modal('hide') }, this.globalService.timeout);
      } else {
        this.editMessage = _ingredient.msg;
        this.globalService.displayMsg('alert-danger', '#editIngredientMsg');
        $('#editIngredientBtn').prop('disabled', false);
      };
    });
  };

  onCancelIngredientEdit(): void {
    (<any>$('#editIngredientModal')).modal('hide');
    this.clearForm();
  };
}
