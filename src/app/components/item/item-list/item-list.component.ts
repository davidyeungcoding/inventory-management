import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { ItemService } from 'src/app/services/item.service';

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
    private itemService: ItemService
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

  swapClass(remove: string, add: string, target: string): void {
    $(`${target}`).removeClass(remove);
    $(`${target}`).addClass(add);
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
    // handle removing item from all ingredients in ingredient list
  }

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
    this.itemService.deleteItem(this.targetItem!).subscribe(_res => {
      this.deleteMessage = _res.msg;

      if (_res.status === 200) {
        this.itemService.changeItemList(this.removeItemFromList(this.targetItem!));
        this.swapClass('alert-danger', 'alert-success', '#deleteResult');
        $('#deleteMsgContainer').css('display', 'inline');
        
        setTimeout(() => {
          (<any>$('#deleteItem')).modal('hide');
        }, 1500);
      } else {
        this.swapClass('alert-success', 'alert-danger', '#deleteResult');
        $('#deleteMsgContainer').css('display', 'inline');
        // handle error with deletion here
      };
    });
  };

  onBack(): void {
    console.log('back');
    // handle go back
  };

  onAddItem(): void {
    console.log('new item');
    // handle add new item
  };
}
