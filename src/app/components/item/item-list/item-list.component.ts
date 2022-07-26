import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { ItemService } from 'src/app/services/item.service';
import { GlobalService } from 'src/app/services/global.service';
import { IngredientService } from 'src/app/services/ingredient.service';

import { Item } from 'src/app/interfaces/item';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css']
})
export class ItemListComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  itemList: Item[] = [];
  targetItem: Item|null = null;
  deleteMessage: String = '';

  constructor(
    private itemService: ItemService,
    private globalService: GlobalService,
    private ingredientService: IngredientService
  ) { }

  ngOnInit(): void {
    this.retrieveItemList();
    this.subscriptions.add(this.itemService.itemList.subscribe(_list => this.itemList = _list));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ======================
  // || Helper Functions ||
  // ======================

  convertPrice(list: Item[]): void {
    list.forEach(item => {
      const price = item.price;
      item.price = `$${price.substring(0, price.length - 2)}.${price.substring(price.length - 2)}`;
    });
  };

  removeItemFromList(item: Item): Item[] {
    let temp = this.itemList;

    for (let i = 0; i < temp.length; i++) {
      if (temp[i]._id === item._id) temp.splice(i, 1);
      break;
    };

    return temp;
  };

  removeItemFromIngredient(): void {
    this.ingredientService.purgeItem(this.targetItem!).subscribe(_res => {
      if (_res.status !== 200) {
        this.deleteMessage = _res.msg;
        this.globalService.displayMsg('alert-danger', '#deleteResult', '#deleteMsgContainer');
      };

      if (_res.status === 200) {
        this.globalService.displayMsg('alert-success', '#deleteResult', '#deleteMsgContainer');

        setTimeout(() => {
          (<any>$('#deleteItem')).modal('hide');
        }, 1500);
      };
    });
  };

  onTargetItem(item: Item, target: string): void {
    $(`${target}`).css('display', 'none');
    this.targetItem = item;
  };

  // =======================
  // || General Functions ||
  // =======================

  retrieveItemList(): void {
    this.itemService.getFullItemList().subscribe(_list => {
      this.convertPrice(_list.msg);
      this.itemService.changeItemList(_list.msg);
    });
  };

  onDelete(): void {
      $('#deleteMsgContainer').css('display', 'none');
      this.deleteMessage = 'test';
      this.removeItemFromIngredient();

    this.itemService.deleteItem(this.targetItem!).subscribe(_res => {
      $('#deleteMsgContainer').css('display', 'none');
      this.deleteMessage = _res.msg;

      if (_res.status === 200) {
        this.itemService.changeItemList(this.removeItemFromList(this.targetItem!));
        this.removeItemFromIngredient();
      } else {
        this.globalService.displayMsg('alert-danger', '#deleteResult', '#deleteMsgContainer');
      };
    });
  };

  onBack(): void {
    console.log('back');
    // handle go back
  };
}
