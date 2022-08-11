import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { ItemService } from 'src/app/services/item.service';
import { GlobalService } from 'src/app/services/global.service';

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
    private itemService: ItemService,
    private globalService: GlobalService
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
      this.globalService.displayMsg('alert-danger', '#editMsg', '#editMsgContainer');
    };

    return check;
  };

  validatePrice(price: string): boolean {
    const check = this.itemService.testPrice(price);

    if (!check) {
      this.editMessage = 'Please enter a valid price.';
      this.globalService.displayMsg('alert-danger', '#editMsg', '#editMsgContainer');
    };

    return check;
  };

  convertPrice(price: string): string {
    return `$${price.substring(0, price.length - 2)}.${price.substring(price.length - 2)}`;
  };

  // =======================
  // || General Functions ||
  // =======================

  onEditItem(): void {
    const form =  this.editItem.value;
    if (form.name.length && !this.validateName(form.name)) return;
    if (form.price.length && !this.validatePrice(form.price)) return;
    $('#editItemBtn').prop('disabled', true);

    const tempItem:any = {
      active: form.active,
      available: form.available
    };
    
    if (form.name) tempItem.name = form.name;
    if (form.price) tempItem.price = this.itemService.parsePrice(form.price);
    if (!form.name && !form.price && tempItem.active === JSON.stringify(this.targetItem!.active)
      && tempItem.available === JSON.stringify(this.targetItem!.available)) {
      this.editMessage = 'No changes detected';
      this.globalService.displayMsg('alert-danger', '#editMsg', '#editMsgContainer');
      $('#editItemBtn').prop('disabled', false);
      return;
    };
    
    const payload = {
      id: this.targetItem?._id,
      update: tempItem
    };

    this.itemService.editItemDetails(payload).subscribe(_item => {
      if (_item.status === 200) {
        this.editMessage = 'Item successfully updated';
        this.globalService.displayMsg('alert-success', '#editMsg', '#editMsgContainer');
        _item.msg.price = this.convertPrice(_item.msg.price);
        this.itemService.changeItemList(this.itemService.replaceItem(this.itemList, _item.msg));
        
        setTimeout(() => {
          (<any>$('#editItemModal')).modal('hide');
          this.clearForm();
          $('#editItemBtn').prop('disabled', false);
          $('#editMsgContainer').css('display', 'none');
        }, 1500);
      } else {
        this.editMessage = _item.msg;
        this.globalService.displayMsg('alert-danger', '#editMsg', '#editMsgContainer');
        $('#editItemBtn').prop('disabled', false);
      };
    });
  };

  onCancelEdit(): void {
    this.clearForm();
    (<any>$('#editItemModal')).modal('hide');
    $('#editItemBtn').prop('disabled', false);
    $('#editMsgContainer').css('display', 'none');
  };
}
