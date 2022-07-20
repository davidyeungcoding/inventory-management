import { Component, OnDestroy, OnInit } from '@angular/core';

import { ItemService } from 'src/app/services/item.service';

import { Item } from 'src/app/interfaces/item';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css']
})
export class ItemListComponent implements OnInit, OnDestroy {
  itemList: Item[] = [];

  constructor(
    private itemService: ItemService
  ) { }

  ngOnInit(): void {
    this.retrieveItemList();
  }

  ngOnDestroy(): void {
  }

  // ======================
  // || Helper Functions ||
  // ======================

  processPrice(list: Item[]): void {
    list.forEach(item => {
      const price = item.price;
      item.price = `$${price.substring(0, price.length - 2)}.${price.substring(price.length - 2)}`;
    });
  };

  // =======================
  // || General Functions ||
  // =======================

  retrieveItemList(): void {
    this.itemService.getFullItemList().subscribe(_list => {
      this.processPrice(_list.msg);
      this.itemList = _list.msg;
    });
  };
}
