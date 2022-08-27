import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { IngredientService } from 'src/app/services/ingredient.service';
import { GlobalService } from 'src/app/services/global.service';
import { UserService } from 'src/app/services/user.service';
import { ItemService } from 'src/app/services/item.service';

import { Ingredient } from 'src/app/interfaces/ingredient';
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
  targetIngredients: Ingredient[] = [];
  fullIngredientList: any[] = [];
  deleteMessage: String = '';
  editForm = new FormGroup({
    name: new FormControl(''),
    price: new FormControl(''),
    active: new FormControl(''),
    available: new FormControl('')
  });

  constructor(
    private ingredientService: IngredientService,
    private globalService: GlobalService,
    private userService: UserService,
    private itemService: ItemService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.ingredientService.ingredientList.subscribe(_list => this.fullIngredientList = _list));
    this.subscriptions.add(this.itemService.itemList.subscribe(_list => this.itemList = _list));
    this.retrieveItemList();
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

  onEditItemIngredients(item: Item, target: string): void {
    this.onTargetItem(item, target);
    this.targetIngredients = item.ingredients;
    this.retrieveIngredientList();
    this.itemService.clearHighlight();
    this.itemService.changeToChange({});
  };

  filterIngredientList(item: Ingredient[], list: Ingredient[], index: number): any {
    if (!item.length) return list;
    const id = item[index]._id;
    let temp = [...list];

    for (let i = 0; i < temp.length; i++) {
      if (id === temp[i]._id) {
        temp.splice(i, 1);
        if (index + 1 !== item.length) temp = this.filterIngredientList(item, temp, ++index);
        break;
      };
    };

    return temp;
  };

  // =======================
  // || General Functions ||
  // =======================

  retrieveItemList(): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.logout();
    const storeId = document.URL.substring(document.URL.lastIndexOf('/') + 1);

    this.itemService.getFullItemList(token, storeId).subscribe(_list => {
      this.convertPrice(_list.msg);
      this.itemService.changeItemList(_list.msg);
    });
  };

  retrieveIngredientList(): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.logout();
    const storeId = document.URL.substring(document.URL.lastIndexOf('/') + 1);

    this.ingredientService.getIngredientList(token, storeId).subscribe(_list => {
      const list = this.filterIngredientList(this.targetItem!.ingredients, _list.msg, 0);
      this.ingredientService.changeIngredientList(list);
    });
  };

  onEditDetails(item: Item, target: string): void {
    this.onTargetItem(item, target);
    $('#editItemBtn').prop('disabled', false);
    $('#editName').attr('placeholder', this.targetItem!.name);
    $('#editPrice').attr('placeholder', this.targetItem!.price);

    this.editForm.setValue({
      name: '',
      price: '',
      active: item.active.toString(),
      available: item.available.toString()
    });
  };

  onBack(): void {
    this.globalService.redirectUser('store-list');
  };
}
