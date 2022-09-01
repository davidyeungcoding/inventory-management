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
  editMessage: string = '';

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

  clearForm():void {
    this.editItem.setValue({
      name: '',
      price: '',
      active: '',
      available: ''
    });
  };

  validateName(name: string): boolean {
    const check = this.globalService.testName(name);

    if (!check) {
      this.editMessage = 'Please enter a valid item name. Name may not include special characters.';
      this.globalService.displayMsg('alert-danger', '#editItemMsg');
    };

    return check;
  };

  validatePrice(price: string): boolean {
    const check = this.itemService.testPrice(price);

    if (!check) {
      this.editMessage = 'Please enter a valid price.';
      this.globalService.displayMsg('alert-danger', '#editItemMsg');
    };

    return check;
  };

  convertPrice(price: string): string {
    return `$${price.substring(0, price.length - 2)}.${price.substring(price.length - 2)}`;
  };

  handleMissingToken(): void {
    this.editMessage = this.globalService.missingUserMsg;
    this.globalService.displayMsg('alert-danger', '#editItemMsg');

    setTimeout(() => {
      $('#editItemMsgContainer').css('display', 'none');
      (<any>$('#editItemModal')).modal('hide');
      this.userService.logout();
    }, this.globalService.timeoutLong);

    return;
  };

  validateForm(form: any): boolean {
    if (form.name.length && !this.validateName(form.name)) return false;
    if (form.price.length && !this.validatePrice(form.price)) return false;
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

  // =======================
  // || General Functions ||
  // =======================

  onEditItem(): void {
    $('#editItemMsgContainer').css('display', 'none');
    const token = localStorage.getItem('token');
    if (!token) return this.handleMissingToken();
    const form =  this.editItem.value;
    if (!this.validateForm(form)) return;
    const tempItem = this.buildPayloadItem(form);
    
    if (!form.name && !form.price && tempItem.active === JSON.stringify(this.targetItem!.active)
      && tempItem.available === JSON.stringify(this.targetItem!.available)) {
      this.editMessage = 'No changes detected';
      this.globalService.displayMsg('alert-danger', '#editItemMsg');
      return;
    };
    
    const payload = {
      id: this.targetItem!._id,
      update: tempItem
    };

    $('#editItemBtn').prop('disabled', true);

    this.itemService.editItemDetails(payload, token).subscribe(_item => {
      if (_item.status === 200) {
        this.editMessage = 'Item successfully updated';
        this.globalService.displayMsg('alert-success', '#editItemMsg');
        _item.msg.price = this.convertPrice(_item.msg.price);
        this.itemService.changeItemList(this.itemService.replaceItem(this.itemList, _item.msg));
        
        setTimeout(() => {
          (<any>$('#editItemModal')).modal('hide');
          this.clearForm();
          $('#editItemBtn').prop('disabled', false);
          $('#editItemMsgContainer').css('display', 'none');
        }, this.globalService.timeout);
      } else {
        this.editMessage = _item.msg;
        this.globalService.displayMsg('alert-danger', '#editItemMsg');
        $('#editItemBtn').prop('disabled', false);
      };
    });
  };

  onCancelEdit(): void {
    this.clearForm();
    (<any>$('#editItemModal')).modal('hide');
    $('#editItemBtn').prop('disabled', false);
    $('#editItemMsgContainer').css('display', 'none');
  };
}
