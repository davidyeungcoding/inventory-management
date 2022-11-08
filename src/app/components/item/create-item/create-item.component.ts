import { Component, Input, OnDestroy, OnInit } from '@angular/core';
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
  @Input() createItem: any;
  private subscriptions = new Subscription();
  private itemList: Item[] = [];
  private timeout?: number;
  nameError?: string;
  priceError?: string;
  addMessage: string = '';

  constructor(
    private globalService: GlobalService,
    private userService: UserService,
    private itemService: ItemService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.systemMsg.subscribe(_msg => this.addMessage = _msg));
    this.subscriptions.add(this.itemService.itemList.subscribe(_list => this.itemList = _list));
    this.subscriptions.add(this.globalService.timeout.subscribe(_time => this.timeout = _time));
    this.subscriptions.add(this.itemService.nameError.subscribe(_msg => this.nameError = _msg));
    this.subscriptions.add(this.itemService.priceError.subscribe(_msg => this.priceError = _msg));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ==================
  // || Form Getters ||
  // ==================

  get name() { return this.createItem.get('name') };
  get price() { return this.createItem.get('price') };

  // ======================
  // || Helper Functions ||
  // ======================

  validateName(name: any): boolean {
    const check = this.globalService.testName(name);

    if (!check) {
      this.userService.changeSystemMsg('Please enter a valid item name. Name may not include special characters.');
      this.globalService.displayMsg('alert-danger', '#createItemMsg');
      $('#createItemBtn').prop('disabled', false);
    };

    return check;
  };

  validatePrice(price: any): boolean {
    const check = this.itemService.testPrice(price);

    if (!check) {
      this.userService.changeSystemMsg('Please enter a valid price.');
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
    if (!token) return this.userService.handleMissingTokenModal('#createItemMsg', '#createItemModal');
    const form = this.createItem.value;
    if (!this.validateForm(form)) return;
    form.price = this.itemService.parsePrice(form.price!);
    form.storeId = document.URL.substring(document.URL.lastIndexOf('/') + 1);
    
    this.itemService.createItem(form, token).subscribe(_res => {
      if (_res.status === 201) {
        if (_res.token) localStorage.setItem('token', _res.token);
        this.userService.changeSystemMsg('Item successfully created');
        this.globalService.displayMsg('alert-success', '#createItemMsg');
        this.addItemToList(_res.msg);
        setTimeout(() => { (<any>$('#createItemModal')).modal('hide') }, this.timeout);
      } else {
        this.userService.changeSystemMsg(_res.msg);
        this.globalService.displayMsg('alert-danger', '#createItemMsg');
        $('#createItemBtn').prop('disabled', false);
      };
    });
  };
}
