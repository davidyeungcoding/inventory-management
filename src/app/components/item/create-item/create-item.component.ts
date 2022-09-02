import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { GlobalService } from 'src/app/services/global.service';
import { UserService } from 'src/app/services/user.service';
import { ItemService } from 'src/app/services/item.service';

import { Item } from 'src/app/interfaces/item';

@Component({
  selector: 'app-create-item',
  templateUrl: './create-item.component.html',
  styleUrls: ['./create-item.component.css']
})
export class CreateItemComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  private itemList: Item[] = [];
  addMessage: string = '';
  createItem = new FormGroup({
    name: new FormControl(''),
    price: new FormControl(''),
    active: new FormControl('false'),
    available: new FormControl('false'),
    storeId: new FormControl('')
  });

  constructor(
    private globalService: GlobalService,
    private userService: UserService,
    private itemService: ItemService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.itemService.itemList.subscribe(_list => this.itemList = _list));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ======================
  // || Helper Functions ||
  // ======================

  clearForm(): void {
    this.createItem.setValue({
      name: '',
      price: '',
      active: 'false',
      available: 'false',
      storeId: ''
    });
  };

  validateName(name: any): boolean {
    const check = this.globalService.testName(name);

    if (!check) {
      this.addMessage = 'Please enter a valid item name. Name may not include special characters.';
      this.globalService.displayMsg('alert-danger', '#createItemMsg');
      $('#createItemBtn').prop('disabled', false);
    };

    return check;
  };

  validatePrice(price: any): boolean {
    const check = this.itemService.testPrice(price);

    if (!check) {
      this.addMessage = 'Please enter a valid price.';
      this.globalService.displayMsg('alert-danger', '#createItemMsg');
      $('#createItemBtn').prop('disabled', false);
    };

    return check;
  };

  convertPrice(price: string): string {
    const breakPoint = price.length - 2;
    return `$${price.substring(0, breakPoint)}.${price.substring(breakPoint)}`;
  };

  addItemToList(item: Item): void {
    const temp = [...this.itemList];
    item.price = this.convertPrice(item.price);
    temp.push(item);
    this.itemService.changeItemList(temp);
  };

  handleMissingToken(): void {
    this.addMessage = this.globalService.missingTokenMsg;
    this.globalService.displayMsg('alert-danger', '#createItemMsg');

    setTimeout(() => {
      (<any>$('#createItemModal')).modal('hide');
      this.userService.logout();
    }, this.globalService.timeoutLong);
  };

  validateForm(form: any): boolean {
    if (!this.validateName(form.name) || !this.validatePrice(form.price)) return false;
    return true;
  };

  // =======================
  // || General Functions ||
  // =======================

  onCreateItem(): void {
    $('#createItemMsgContainer').css('display', 'none');
    $('#createItemBtn').prop('disabled', true);
    const token = localStorage.getItem('token');
    if (!token) return this.handleMissingToken();
    const form = this.createItem.value;
    if (!this.validateForm(form)) return;
    form.price = this.itemService.parsePrice(form.price!);
    form.storeId = document.URL.substring(document.URL.lastIndexOf('/') + 1);
    
    this.itemService.createItem(form, token).subscribe(_res => {
      if (_res.status === 201) {
        this.addMessage = 'Item successfully created';
        this.globalService.displayMsg('alert-success', '#createItemMsg');
        this.addItemToList(_res.msg);
        
        setTimeout(() => {
          (<any>$('#createItemModal')).modal('hide');
          this.clearForm();
        }, this.globalService.timeout);
      } else {
        this.addMessage = _res.msg;
        this.globalService.displayMsg('alert-danger', '#createItemMsg');
        $('#createItemBtn').prop('disabled', false);
      };
    });
  };

  onCancelCreate(): void {
    (<any>$('#createItemModal')).modal('hide');
    this.clearForm();
  };
}
