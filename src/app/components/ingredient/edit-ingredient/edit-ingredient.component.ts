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
  private timeout?: number;
  editMessage: string = '';
  nameError?: string;

  constructor(
    private ingredientService: IngredientService,
    private globalService: GlobalService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.ingredientService.ingredientList.subscribe(_list => this.ingredientList = _list));
    this.subscriptions.add(this.ingredientService.nameError.subscribe(_msg => this.nameError = _msg));
    this.subscriptions.add(this.userService.systemMsg.subscribe(_msg => this.editMessage = _msg));
    this.subscriptions.add(this.globalService.timeout.subscribe(_time => this.timeout = _time));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ==================
  // || Form Getters ||
  // ==================

  get name() { return this.editIngredient.get('name') };

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
    if (!name.length) {
      this.userService.changeSystemMsg('No changes detected');
      this.globalService.displayMsg('alert-light', '#editIngredientMsg');
      $('#editIngredientBtn').prop('disabled', false);
      return false;
    };

    const check = this.globalService.testName(name);

    if (!check) {
      this.userService.changeSystemMsg('Please enter a valid item name. Name may not include special characters.');
      this.globalService.displayMsg('alert-danger', '#editIngredientMsg');
      $('#editIngredientBtn').prop('disabled', false);
    };

    return check;
  };

  replaceIngredient(ingredient: Ingredient): void {
    const temp = this.globalService.replaceInList(this.ingredientList, ingredient);
    this.ingredientService.changeIngredientList(temp);
  };

  // =======================
  // || General Functions ||
  // =======================

  onEditIngredient(): void {
    $('#editIngredientMsgContainer').css('display', 'none');
    $('#editIngredientBtn').prop('disabled', true);
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingTokenModal('#editIngredientMsg', '#editIngredientModal');
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
        this.userService.changeSystemMsg('Ingredient successfully updated');
        this.globalService.displayMsg('alert-success', '#editIngredientMsg');
        this.replaceIngredient(_ingredient.msg);
        setTimeout(() => { (<any>$('#editIngredientModal')).modal('hide') }, this.timeout);
      } else {
        this.userService.changeSystemMsg(_ingredient.msg);
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
