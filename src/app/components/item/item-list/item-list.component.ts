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

  removeItemFromList(item: Item): Item[] {
    let temp = this.itemList;

    for (let i = 0; i < temp.length; i++) {
      const _item = temp[i];
      if (_item._id === item._id) temp.splice(i, 1);
    };

    return temp;
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

  onMarkForEdit(item: Item): void {
    this.targetItem = item;
  };

  onDelete(item: Item): void {
    this.itemService.deleteItem(item).subscribe(_res => {
      if (_res.status === 200) {
        this.itemService.changeItemList(this.removeItemFromList(item));
        // display success message
      }
      // handle error with deletion here
    });
  };

  onBack(): void {
    console.log('back');
  };

  onAddItem(): void {
    console.log('new item');
  };
}
