import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { ItemService } from 'src/app/services/item.service';
import { GlobalService } from 'src/app/services/global.service';

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
    private itemService: ItemService,
    private globalService: GlobalService
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

  changeSelected(ingredient: Ingredient, action: string): void {
    const temp = {...this.toChange};
    const target = temp[ingredient._id];
    target ? delete temp[ingredient._id] : temp[ingredient._id] = action;
    this.itemService.changeToChange(temp);
  };

  highlight(ingredient: Ingredient): void {
    this.toChange[ingredient._id] ? $(`#${ingredient._id}`).removeClass('selected')
    : $(`#${ingredient._id}`).addClass('selected');
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
    this.highlight(ingredient);
    this.changeSelected(ingredient, 'add');
  };

  toRemove(ingredient: Ingredient): void {
    this.highlight(ingredient);
    this.changeSelected(ingredient, 'remove');
  };

  onUpdate(): void {
    $('#editItemIngredientMsgContainer').css('display', 'none');
    $('#updateItemIngredientBtn').prop('disabled', true);
    const payload = {
      id: this.targetItem?._id,
      toChange: this.toChange
    };

    this.itemService.updateItemIngredient(payload).subscribe(_item => {
      if (_item.status === 200) {
        this.editItemIngredientMsg = 'Ingredients successfully updated';
        this.globalService.displayMsg('alert-success', '#editItemIngredientMsg', '#editItemIngredientMsgContainer');
        this.updateItemList(_item.msg);

        setTimeout(() => {
          (<any>$('#editItemIngredientsModal')).modal('hide');
          $('#eidtItemIngredientMsgContainer').css('display', 'none');
          $('#updateItemIngredientBtn').prop('disabled', false);
        }, 1500);
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
    this.itemService.clearHighlight();
  };
}
