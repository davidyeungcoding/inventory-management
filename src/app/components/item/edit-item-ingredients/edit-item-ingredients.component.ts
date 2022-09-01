import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { GlobalService } from 'src/app/services/global.service';
import { UserService } from 'src/app/services/user.service';
import { ItemService } from 'src/app/services/item.service';

import { Item } from 'src/app/interfaces/item';
import { Ingredient } from 'src/app/interfaces/ingredient';

@Component({
  selector: 'app-edit-item-ingredients',
  templateUrl: './edit-item-ingredients.component.html',
  styleUrls: ['./edit-item-ingredients.component.css']
})
export class EditItemIngredientsComponent implements OnInit, OnDestroy {
  @Input() targetItem!: Item|null;
  @Input() ingredientList!: any[];
  @Input() fullIngredientList!: any[];
  private subscriptions = new Subscription();
  private toChange: any = {};
  editItemIngredientMsg: string = '';
  itemList: Item[] = [];

  constructor(
    private globalService: GlobalService,
    private userService: UserService,
    private itemService: ItemService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.itemService.itemList.subscribe(_list => this.itemList = _list));
    this.subscriptions.add(this.itemService.toChange.subscribe(_targets => this.toChange = _targets));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ======================
  // || Helper Functions ||
  // ======================

  changeSelected(id: string, action: string): void {
    const temp = {...this.toChange};
    temp[id] ? delete temp[id] : temp[id] = action;
    this.itemService.changeToChange(temp);
  };

  updateItemList(item: Item): void {
    const array = [...this.itemList];
    
    for (let i = 0; i < array.length; i++) {
      if (array[i]._id === item._id) {
        array[i] = item;
        break;
      };
    };

    this.itemService.changeItemList(array);
  };

  // =======================
  // || General Functions ||
  // =======================

  toAdd(ingredient: Ingredient): void {
    this.globalService.highlight(ingredient._id, this.toChange);
    this.changeSelected(ingredient._id, 'add');
  };

  toRemove(ingredient: Ingredient): void {
    this.globalService.highlight(ingredient._id, this.toChange);
    this.changeSelected(ingredient._id, 'remove');
  };

  onUpdate(): void {
    $('#editItemIngredientMsgContainer').css('display', 'none');
    const token = localStorage.getItem('token');
    if (!token) return this.userService.logout();
    if (!this.targetItem) return (<any>$('#editItemIngredientModal')).modal('hide');
    $('#updateItemIngredientBtn').prop('disabled', true);
    const payload = {
      id: this.targetItem._id,
      toChange: this.toChange
    };

    this.itemService.updateItemIngredient(payload, token).subscribe(_item => {
      if (_item.status === 200) {
        this.editItemIngredientMsg = 'Ingredients successfully updated';
        this.globalService.displayMsg('alert-success', '#editItemIngredientMsg', '#editItemIngredientMsgContainer');
        let price = _item.msg.price;
        _item.msg.price = `$${price.substring(0, price.length - 2)}.${price.substring(price.length - 2)}`;
        this.updateItemList(_item.msg);

        setTimeout(() => {
          (<any>$('#editItemIngredientsModal')).modal('hide');
          $('#eidtItemIngredientMsgContainer').css('display', 'none');
          $('#updateItemIngredientBtn').prop('disabled', false);
        }, this.globalService.timeout);
      } else {
        this.editItemIngredientMsg = _item.msg;
        this.globalService.displayMsg('alert-danger', '#editItemIngredientMsg', '#editItemIngredientMsgContainer');
        $('#updateItemIngredientBtn').prop('disabled', false);
      };
    });
  };

  onCancel(): void {
    (<any>$('#editItemIngredientsModal')).modal('hide');
    this.itemService.changeToChange({});
    this.globalService.clearHighlight();
  };
}
