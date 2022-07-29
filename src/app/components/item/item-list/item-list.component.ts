import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
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
  editForm = new FormGroup({
    name: new FormControl(''),
    price: new FormControl(''),
    active: new FormControl(''),
    available: new FormControl('')
  });

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

  onEditSetup(item: Item, target: string): void {
    this.onTargetItem(item, target);
    $('#editName').attr('placeholder', this.targetItem!.name);
    $('#editPrice').attr('placeholder', this.targetItem!.price);
    this.editForm.setValue({
      name: item.name,
      price: item.price,
      active: item.active.toString(),
      available: item.available.toString()
    });
  };

  onBack(): void {
    console.log('back');
    // handle go back
  };
}
