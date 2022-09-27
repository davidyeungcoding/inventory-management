import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { GlobalService } from 'src/app/services/global.service';
import { UserService } from 'src/app/services/user.service';
import { ItemService } from 'src/app/services/item.service';

import { Ingredient } from 'src/app/interfaces/ingredient';
import { Item } from 'src/app/interfaces/item';

@Component({
  selector: 'app-edit-item-ingredients',
  templateUrl: './edit-item-ingredients.component.html',
  styleUrls: ['./edit-item-ingredients.component.css']
})
export class EditItemIngredientsComponent implements OnInit, OnDestroy {
  @Input() fullIngredientList!: any[];
  @Input() ingredientList!: any[];
  @Input() targetItem!: Item|null;
  @Input() toChange?: any;
  private subscriptions = new Subscription();
  private itemList: Item[] = [];
  private timeout?: number;
  editItemIngredientMessage?: string;

  constructor(
    private globalService: GlobalService,
    private userService: UserService,
    private itemService: ItemService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.systemMsg.subscribe(_msg => this.editItemIngredientMessage = _msg));
    this.subscriptions.add(this.itemService.itemList.subscribe(_list => this.itemList = _list));
    this.subscriptions.add(this.globalService.timeout.subscribe(_time => this.timeout = _time));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ======================
  // || Helper Functions ||
  // ======================

  changeSelected(id: string, action: string): void {
    this.toChange[id] ? delete this.toChange[id] : this.toChange[id] = action;
  };

  updateItemList(item: Item): void {
    const temp = this.globalService.replaceInList(this.itemList, item);
    this.itemService.changeItemList(temp);
  };

  handleNoChanges(): void {
    this.userService.changeSystemMsg('No changes detected');
    this.globalService.displayMsg('alert-danger', '#editItemIngredientMsg');
    $('#editItemIngredientBtn').prop('disabled', false);
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
    $('#editItemIngredientBtn').prop('disabled', true);
    $('#editItemIngredientMsgContainer').css('display', 'none');
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingTokenModal('#editItemIngredientMsg', '#editItemIngredientsModal');
    if (!Object.keys(this.toChange).length) return this.handleNoChanges();
    
    const payload = {
      id: this.targetItem!._id,
      toChange: this.toChange
    };

    this.itemService.updateItemIngredient(payload, token).subscribe(_item => {
      if (_item.status === 200) {
        if (_item.token) localStorage.setItem('token', _item.token);
        this.userService.changeSystemMsg('Ingredients successfully updated');
        this.globalService.displayMsg('alert-success', '#editItemIngredientMsg');
        let price = _item.msg.price;
        _item.msg.price = `$${price.substring(0, price.length - 2)}.${price.substring(price.length - 2)}`;
        this.updateItemList(_item.msg);
        setTimeout(() => { (<any>$('#editItemIngredientsModal')).modal('hide') }, this.timeout);
      } else {
        this.userService.changeSystemMsg(_item.msg);
        this.globalService.displayMsg('alert-danger', '#editItemIngredientMsg');
        $('#editItemIngredientBtn').prop('disabled', false);
      };
    });
  };
}
