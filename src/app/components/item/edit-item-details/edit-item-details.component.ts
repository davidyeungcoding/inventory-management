import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { GlobalService } from 'src/app/services/global.service';
import { UserService } from 'src/app/services/user.service';
import { ItemService } from 'src/app/services/item.service';

import { Item } from 'src/app/interfaces/item';

@Component({
  selector: 'app-edit-item-details',
  templateUrl: './edit-item-details.component.html',
  styleUrls: ['./edit-item-details.component.css']
})
export class EditItemDetailsComponent implements OnInit, OnDestroy {
  @Input() targetItem!: Item|null;
  @Input() editItem!: any;
  private subscriptions = new Subscription();
  private itemList: Item[] = [];
  private timeout?: number;
  nameError?: string;
  priceError?: string;
  editMessage: string = '';

  constructor(
    private globalService: GlobalService,
    private userService: UserService,
    private itemService: ItemService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.systemMsg.subscribe(_msg => this.editMessage = _msg));
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

  get name() { return this.editItem.get('name') };
  get price() { return this.editItem.get('price') };

  // ======================
  // || Helper Functions ||
  // ======================

  validateName(name: string): boolean {
    const check = this.globalService.testName(name);

    if (!check) {
      this.userService.changeSystemMsg('Please enter a valid item name. Name may not include special characters.');
      this.globalService.displayMsg('alert-danger', '#editItemMsg');
    };

    return check;
  };

  validatePrice(price: string): boolean {
    const check = this.itemService.testPrice(price);

    if (!check) {
      this.userService.changeSystemMsg('Please enter a valid price.');
      this.globalService.displayMsg('alert-danger', '#editItemMsg');
    };

    return check;
  };

  convertPrice(price: string): string {
    return `$${price.substring(0, price.length - 2)}.${price.substring(price.length - 2)}`;
  };

  validateForm(form: any): boolean {
    if (form.name.length && !this.validateName(form.name)
      || form.price.length && !this.validatePrice(form.price)) {
      $('#editItemBtn').prop('disabled', false);
      return false;
    };

    return true;
  };

  buildPayloadItem(form: any): any {
    const tempItem: any = {
      active: form.active,
      available: form.available
    };

    if (form.name) tempItem.name = form.name;
    if (form.price) tempItem.price = this.itemService.parsePrice(form.price);
    return tempItem;
  };

  checkForChanges(form: any, item: any): boolean {
    return !form.name && !form.price
      && item.active === JSON.stringify(this.targetItem!.active)
      && item.available === JSON.stringify(this.targetItem!.available) ? true : false;
  };

  // =======================
  // || General Functions ||
  // =======================

  onEditItem(): void {
    $('#editItemMsgContainer').css('display', 'none');
    $('#editItemBtn').prop('disabled', true);
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingTokenModal('#editItemMsg', '#editItemModal');;
    const form =  this.editItem.value;
    if (!this.validateForm(form)) return;
    const tempItem = this.buildPayloadItem(form);
    
    if (this.checkForChanges(form, tempItem)) {
      this.userService.changeSystemMsg('No changes detected');
      this.globalService.displayMsg('alert-danger', '#editItemMsg');
      $('#editItemBtn').prop('disabled', false);
      return;
    };
    
    const payload = {
      id: this.targetItem!._id,
      update: tempItem
    };

    this.itemService.editItemDetails(payload, token).subscribe(_item => {
      if (_item.status === 200) {
        if (_item.token) localStorage.setItem('token', _item.token);
        this.userService.changeSystemMsg('Item successfully updated');
        this.globalService.displayMsg('alert-success', '#editItemMsg');
        _item.msg.price = this.convertPrice(_item.msg.price);
        const temp = this.globalService.replaceInList(this.itemList, _item.msg);
        this.itemService.changeItemList(temp);
        setTimeout(() => { (<any>$('#editItemModal')).modal('hide') }, this.timeout);
      } else {
        this.userService.changeSystemMsg(_item.msg);
        this.globalService.displayMsg('alert-danger', '#editItemMsg');
        $('#editItemBtn').prop('disabled', false);
      };
    });
  };
}
