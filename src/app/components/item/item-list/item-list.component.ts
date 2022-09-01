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
  targetIngredients: Ingredient[] = [];
  fullIngredientList: any[] = [];
  targetItem: Item|null = null;
  errorMessage: string = '';
  itemList: Item[] = [];
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
    this.itemService.changeItemList([]);
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

  handleMissingUser(): void {
    this.errorMessage = this.globalService.missingUserMsg;
    this.globalService.displayMsg('alert-danger', '#itemListMsg');
    setTimeout(() => { this.userService.logout() }, this.globalService.timeoutLong);
  };

  retrieveIngredientList(): void {
    const token = localStorage.getItem('token');
    if (!token) return this.handleMissingUser();
    const storeId = document.URL.substring(document.URL.lastIndexOf('/') + 1);

    this.ingredientService.getIngredientList(token, storeId).subscribe(_list => {
      if (_list.status === 200) {
        $('#itemListMsgContainer').css('display', 'none');
        const list = this.globalService.filterList(this.targetItem!.ingredients, _list.msg, 0);
        this.ingredientService.changeIngredientList(list);
        (<any>$('#editItemIngredientsModal')).modal('show');
      } else {
        this.errorMessage = _list.msg;
        this.globalService.displayMsg('alert-danger', '#itemListMsg');
      };
    });
  };

  // =======================
  // || General Functions ||
  // =======================

  retrieveItemList(): void {
    const token = localStorage.getItem('token');
    if (!token) return this.handleMissingUser();
    const storeId = document.URL.substring(document.URL.lastIndexOf('/') + 1);

    this.itemService.getFullItemList(token, storeId).subscribe(_list => {
      if (_list.status === 200) {
        $('#itemListMsgContainer').css('display', 'none');
        this.convertPrice(_list.msg);
        this.itemService.changeItemList(_list.msg);
      } else {
        this.errorMessage = _list.msg;
        this.globalService.displayMsg('alert-danger', '#itemListMsg');
      };
    });
  };

  onEditDetails(item: Item, target: string): void {
    this.onTargetItem(item, target);
    $('#editItemBtn').prop('disabled', false);
    $('#editName').attr('placeholder', this.targetItem!.name);
    $('#editPrice').attr('placeholder', this.targetItem!.price);
    const token = localStorage.getItem('token');
    
    this.editForm.setValue({
      name: '',
      price: '',
      active: item.active.toString(),
      available: item.available.toString()
    });
    
    return !token ?  this.handleMissingUser() : (<any>$('#editItemModal')).modal('show');
  };

  onEditItemIngredients(item: Item, target: string): void {
    this.onTargetItem(item, target);
    this.targetIngredients = item.ingredients;
    this.retrieveIngredientList();
    this.globalService.clearHighlight();
    this.itemService.changeToChange({});
  };

  onDeleteItem(item: Item, target: string): void {
    $('#deleteItemBtn').prop('disabled', false);
    this.onTargetItem(item, target);
    const token = localStorage.getItem('token');
    return !token ? this.handleMissingUser() : (<any>$('#deleteItemModal')).modal('show');
  };

  onCreateItem(): void {
    $('#createItemMsgContainer').css('display', 'none');
    $('#createItemBtn').prop('disabled', false);
  };

  onBack(): void {
    this.globalService.redirectUser('store-list');
  };
}
