import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
  ingredientsToChange: any = {};
  targetItem: Item|null = null;
  itemListMessage: string = '';
  itemList: Item[] = [];
  editForm = new FormGroup({
    name: new FormControl('', Validators.pattern('^[\\w\\s]+$')),
    price: new FormControl('', Validators.pattern('^\\d*[.]{0,1}\\d{0,2}$')),
    active: new FormControl(''),
    available: new FormControl('')
  });
  createItem = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.pattern('^[\\w\\s]+$')]),
    price: new FormControl('', Validators.pattern('^\\d*[.]{0,1}\\d{0,2}$')),
    active: new FormControl('false'),
    available: new FormControl('false'),
    storeId: new FormControl('')
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

  editFormSetup(item: Item): void {
    this.editForm.setValue({
      name: '',
      price: '',
      active: item.active.toString(),
      available: item.available.toString()
    });

    $('#editName').attr('placeholder', this.targetItem!.name);
    $('#editPrice').attr('placeholder', this.targetItem!.price);
  };

  resetCreateItemForm(): void {
    this.createItem.setValue({
      name: '',
      price: '',
      active: 'false',
      available: 'false',
      storeId: ''
    });

    this.createItem.markAsPristine();
    this.createItem.markAsUntouched();
  };

  modalPrep(elemId: string): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#itemListMsg');
    $(`${elemId}Btn`).prop('disabled', false);
    $(`${elemId}MsgContainer`).css('display', 'none');
    (<any>$(`${elemId}Modal`)).modal('show');
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
        this.globalService.convertPrice(_list.msg);
        this.globalService.sortList(_list.msg, 'name');
        $('.skeleton-entry').css('display', 'none');
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
    this.targetItem = item;
    this.editFormSetup(item);
    this.modalPrep('#editItem');
  };

  onEditItemIngredients(item: Item): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#itemListMsg');
    this.targetItem = item;
    this.targetIngredients = item.ingredients;
    $('#editItemIngredientBtn').prop('disabled', false);
    $('#editItemIngredientMsgContainer').css('display', 'none');
    this.globalService.clearHighlight();
    this.ingredientsToChange = {};
    this.retrieveIngredientList(token);
  };

  onDeleteItem(item: Item): void {
    this.targetItem = item;
    this.modalPrep('#deleteItem');
  };

  onCreateItem(): void {
    this.resetCreateItemForm();
    this.modalPrep('#createItem');
  };

  onBack(): void {
    this.globalService.redirectUser('store-list');
  };
}
