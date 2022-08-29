import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { IngredientService } from 'src/app/services/ingredient.service';
import { GlobalService } from 'src/app/services/global.service';
import { UserService } from 'src/app/services/user.service';

import { Ingredient } from 'src/app/interfaces/ingredient';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-delete-ingredient',
  templateUrl: './delete-ingredient.component.html',
  styleUrls: ['./delete-ingredient.component.css']
})
export class DeleteIngredientComponent implements OnInit, OnDestroy {
  @Input() targetIngredient!: Ingredient|null;
  private subscriptions = new Subscription();
  private ingredientList: Ingredient[] = [];
  deleteMessage: string = '';

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

  removeIngredientFromList(): void {
    let list = [...this.ingredientList];

    for (let i = 0; i < list.length; i++) {
      if (list[i]._id === this.targetIngredient!._id) {
        list.splice(i, 1);
        break;
      };
    };

    this.ingredientService.changeIngredientList(list);
  };

  // =======================
  // || General Functions ||
  // =======================

  onDeleteIngredient(): void {
    $('#deleteIngredientMsgContainer').css('display', 'none');
    $('#deleteIngredientBtn').prop('disabled', true);
    const token = localStorage.getItem('token');
    if (!token) return this.userService.logout();
    if (!this.targetIngredient) return (<any>$('#deleteIngredientModal')).modal('hide');

    this.ingredientService.deleteIngredient(this.targetIngredient, token).subscribe(_res => {
      this.deleteMessage = _res.msg;

      if (_res.status === 200) {
        this.removeIngredientFromList();
        this.globalService.displayMsg('alert-success', '#deleteIngredientMsg', '#deleteIngredientMsgContainer');

        setTimeout(() => {
          (<any>$('#deleteIngredientModal')).modal('hide');
          $('#deleteIngredientBtn').prop('disabled', false);
          $('#deleteIngredientMsgContainer').css('display', 'none');
        }, 1500);
      } else {
        this.globalService.displayMsg('alert-danger', '#deleteIngredientMsg', '#deleteIngredientMsgContainer');
        $('#deleteIngredientBtn').prop('disabled', false);
      };
    });
  };

  onCancelDelete(): void {
    $('#deleteIngredientBtn').prop('disabled', false);
  };
}
