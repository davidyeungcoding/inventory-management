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
  addItem = new FormGroup({
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
    this.addItem.setValue({
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
      this.globalService.displayMsg('alert-danger', '#addMsg', '#addMsgContainer');
    };

    return check;
  };

  validatePrice(price: any): boolean {
    const check = this.itemService.testPrice(price);

    if (!check) {
      this.addMessage = 'Please enter a valid price.';
      this.globalService.displayMsg('alert-danger', '#addMsg', '#addMsgContainer');
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

  // =======================
  // || General Functions ||
  // =======================

  onCreateItem(): void {
    $('#addMsgContainer').css('display', 'none');
    const token = localStorage.getItem('token');
    if (!token) return this.userService.logout();
    const form = this.addItem.value;
    if (!this.validateName(form.name)) return;
    if (!this.validatePrice(form.price)) return;
    $('#createItemBtn').prop('disabled', true);
    form.price = this.itemService.parsePrice(form.price!);
    form.storeId = document.URL.substring(document.URL.lastIndexOf('/') + 1);
    
    this.itemService.createItem(form, token).subscribe(_res => {
      if (_res.status === 201) {
        this.addMessage = 'Item successfully created';
        this.globalService.displayMsg('alert-success', '#addMsg', '#addMsgContainer');
        this.addItemToList(_res.msg);
        
        setTimeout(() => {
          (<any>$('#createItemModal')).modal('hide');
          this.clearForm();
          $('#createItemBtn').prop('disabled', false);
          $('#addMsgContainer').css('display', 'none');
        }, 1500);
      } else {
        this.addMessage = _res.msg;
        this.globalService.displayMsg('alert-danger', '#addMsg', '#addMsgContainer');
        $('#addItemBtn').prop('disabled', false);
      };
    });
  };

  onCancelCreate(): void {
    this.clearForm();
    (<any>$('#createItemModal')).modal('hide');
    $('#createItemBtn').prop('disabled', false);
    $('#addMsgContainer').css('display', 'none');
  };
}
