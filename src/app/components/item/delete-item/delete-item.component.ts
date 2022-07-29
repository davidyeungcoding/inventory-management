import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { ItemService } from 'src/app/services/item.service';
import { GlobalService } from 'src/app/services/global.service';
import { IngredientService } from 'src/app/services/ingredient.service';

import { Item } from 'src/app/interfaces/item';

@Component({
  selector: 'app-delete-item',
  templateUrl: './delete-item.component.html',
  styleUrls: ['./delete-item.component.css']
})
export class DeleteItemComponent implements OnInit, OnDestroy {
  @Input() targetItem!: Item|null;
  private subscriptions = new Subscription();
  itemList: Item[] = [];
  deleteMessage: String = '';

  constructor(
    private itemService: ItemService,
    private globalService: GlobalService,
    private ingredientService: IngredientService
  ) { }

  ngOnInit(): void {
    this.itemService.itemList.subscribe(_list => this.itemList = _list);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ======================
  // || Helper Functions ||
  // ======================

  removeItemFromList(item: Item): Item[] {
    let temp = [...this.itemList];
    
    for (let i = 0; i < temp.length; i++) {
      if (temp[i]._id === item._id) {
        temp.splice(i, 1);
        break;
      };
    };
    
    return temp;
  };

  removeItemFromIngredient(): void {
    this.ingredientService.purgeItem(this.targetItem!).subscribe(_res => {
      if (_res.status === 200) {
        this.globalService.displayMsg('alert-success', '#deleteResult', '#deleteMsgContainer');

        setTimeout(() => {
          (<any>$('#deleteItemModal')).modal('hide');
          $('#deleteItemBtn').prop('disabled', false);
        }, 1500);
      } else {
        this.deleteMessage = _res.msg;
        this.globalService.displayMsg('alert-danger', '#deleteResult', '#deleteMsgContainer');
        $('#deleteItemBtn').prop('disabled', false);
      };
    });
  };

  // =======================
  // || General Functions ||
  // =======================

  onDelete(): void {
    $('#deleteMsgContainer').css('display', 'none');
    $('#deleteItemBtn').prop('disabled', true);

    this.itemService.deleteItem(this.targetItem!).subscribe(_res => {
      this.deleteMessage = _res.msg;

      if (_res.status === 200) {
        this.removeItemFromIngredient();
        this.itemService.changeItemList(this.removeItemFromList(this.targetItem!));
      } else {
        this.globalService.displayMsg('alert-danger', '#deleteResult', '#deleteMsgContainer');
        $('#deleteItemBtn').prop('disabled', false);
      };
    });
  };
}
