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
  private nameSort: boolean = true;
  private priceSort: boolean = true;
  private activeSort: boolean = true;
  private availableSort: boolean = true;
  targetIngredients: Ingredient[] = [];
  fullIngredientList: any[] = [];
  targetItem: Item|null = null;
  itemListMessage: string = '';
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
    this.subscriptions.add(this.userService.systemMsg.subscribe(_msg => this.itemListMessage = _msg));
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

  retrieveIngredientList(token: string): void {
    const storeId = document.URL.substring(document.URL.lastIndexOf('/') + 1);

    this.ingredientService.getIngredientList(token, storeId).subscribe(_list => {
      if (_list.status === 200) {
        if (_list.token) localStorage.setItem('token', _list.token);
        const list = this.globalService.filterList(this.targetItem!.ingredients, _list.msg, 0);
        this.ingredientService.changeIngredientList(list);
        (<any>$('#editItemIngredientsModal')).modal('show');
      } else {
        this.userService.changeSystemMsg(_list.msg);
        this.globalService.displayMsg('alert-danger', '#itemListMsg');
      };
    });
  };

  displaySortIcon(direction: boolean, elemId: string): void {
    const current = direction ? elemId : `${elemId}Reverse`;
    const next = direction ? `${elemId}Reverse` : elemId;
    $(`#${current}`).addClass('hide');
    $(`#${next}`).removeClass('hide');
  };

  handleSortList(term: string, elemId: string): any {
    const temp = [...this.itemList];
    let direction;

    switch (term) {
      case 'name':
        this.displaySortIcon(this.nameSort, elemId);
        direction = this.nameSort;
        this.nameSort = !this.nameSort;
        break;
      case 'price':
        this.displaySortIcon(this.priceSort, elemId);
        this.priceSort ? this.globalService.reverseSortNumberList(temp, term)
        : this.globalService.sortNumberList(temp, term);
        this.priceSort = !this.priceSort;
        return temp;
      case 'active':
        this.displaySortIcon(this.activeSort, elemId);
        direction = this.activeSort;
        this.activeSort = !this.activeSort;
        break;
      case 'available':
        this.displaySortIcon(this.availableSort, elemId);
        direction = this.availableSort;
        this.availableSort = !this.availableSort;
        break;
    };

    direction ? this.globalService.reverseSortList(temp, term)
    : this.globalService.sortList(temp, term);
    return temp;
  };

  // =======================
  // || General Functions ||
  // =======================

  retrieveItemList(): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#itemListMsg');
    const storeId = document.URL.substring(document.URL.lastIndexOf('/') + 1);

    this.itemService.getFullItemList(token, storeId).subscribe(_list => {
      if (_list.status === 200) {
        if (_list.token) localStorage.setItem('token', _list.token);
        this.convertPrice(_list.msg);
        this.globalService.sortList(_list.msg, 'name');
        this.itemService.changeItemList(_list.msg);
      } else {
        this.userService.changeSystemMsg(_list.msg);
        this.globalService.displayMsg('alert-danger', '#itemListMsg');
      };
    });
  };

  sortList(term: string): void {
    if (!this.itemList.length) return;
    const elemId = `itemList${term[0].toUpperCase()}${term.substring(1)}`;
    const temp = this.handleSortList(term, elemId);
    this.itemService.changeItemList(temp);
  };

  onEditDetails(item: Item): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#itemListMsg');
    this.targetItem = item;
    $('#editItemBtn').prop('disabled', false);
    $('#editItemMsgContainer').css('display', 'none');
    $('#editName').attr('placeholder', this.targetItem!.name);
    $('#editPrice').attr('placeholder', this.targetItem!.price);
    
    this.editForm.setValue({
      name: '',
      price: '',
      active: item.active.toString(),
      available: item.available.toString()
    });
    
    (<any>$('#editItemModal')).modal('show');
  };

  onEditItemIngredients(item: Item): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#itemListMsg');
    this.targetItem = item;
    this.targetIngredients = item.ingredients;
    $('#editItemIngredientBtn').prop('disabled', false);
    $('#editItemIngredientMsgContainer').css('display', 'none');
    this.globalService.clearHighlight();
    this.itemService.changeToChange({});
    this.retrieveIngredientList(token);
  };

  onDeleteItem(item: Item): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#itemListMsg');
    this.targetItem = item;
    $('#deleteItemBtn').prop('disabled', false);
    $('#deleteItemMsgContainer').css('display', 'none');
    (<any>$('#deleteItemModal')).modal('show');
  };

  onCreateItem(): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#itemListMsg');
    $('#createItemBtn').prop('disabled', false);
    $('#createItemMsgContainer').css('display', 'none');
    (<any>$('#createItemModal')).modal('show');
  };

  onBack(): void {
    this.globalService.redirectUser('store-list');
  };
}
