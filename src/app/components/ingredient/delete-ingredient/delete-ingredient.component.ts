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
  private timeout?: number;
  deleteMessage: string = '';

  constructor(
    private ingredientService: IngredientService,
    private globalService: GlobalService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.ingredientService.ingredientList.subscribe(_list => this.ingredientList = _list));
    this.subscriptions.add(this.userService.systemMsg.subscribe(_msg => this.deleteMessage = _msg));
    this.subscriptions.add(this.globalService.timeout.subscribe(_time => this.timeout = _time));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ======================
  // || Helper Functions ||
  // ======================

  removeIngredientFromList(): void {
    const temp = this.globalService.purgeFromList(this.ingredientList, this.targetIngredient);
    this.ingredientService.changeIngredientList(temp);
  };

  // =======================
  // || General Functions ||
  // =======================

  onDeleteIngredient(): void {
    $('#deleteIngredientMsgContainer').css('display', 'none');
    $('#deleteIngredientBtn').prop('disabled', true);
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingTokenModal('#deleteIngredientMsg', '#deleteIngredientModal');

    this.ingredientService.deleteIngredient(this.targetIngredient!, token).subscribe(_res => {
      this.userService.changeSystemMsg(_res.msg);

      if (_res.status === 200) {
        if (_res.token) localStorage.setItem('token', _res.token);
        this.globalService.displayMsg('alert-success', '#deleteIngredientMsg');
        this.removeIngredientFromList();
        setTimeout(() => { (<any>$('#deleteIngredientModal')).modal('hide') }, this.timeout);
      } else {
        this.globalService.displayMsg('alert-danger', '#deleteIngredientMsg');
        $('#deleteIngredientBtn').prop('disabled', false);
      };
    });
  };
}
