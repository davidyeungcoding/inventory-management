import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ItemService } from 'src/app/services/item.service';
import { GlobalService } from 'src/app/services/global.service';

import { Item } from 'src/app/interfaces/item';

@Component({
  selector: 'app-create-item',
  templateUrl: './create-item.component.html',
  styleUrls: ['./create-item.component.css']
})
export class CreateItemComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  private itemList: Item[] = [];
  addItem = new FormGroup({
    name: new FormControl(''),
    price: new FormControl(''),
    active: new FormControl('false'),
    available: new FormControl('false')
  });
  addMessage: string = '';

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

  clearForm(): void {
    this.addItem.setValue({
      name: '',
      price: '',
      active: 'false',
      available: 'false'
    });
  };

  validateName(name: any): boolean {
    const regex = new RegExp('^[\\w\\s]+$', 'gm');
    const check = regex.test(name);

    if (!check) {
      this.addMessage = 'Please enter a valid item name. Name may not include special characters.';
      this.globalService.displayMsg('alert-danger', '#addMsg', '#addMsgContainer');
    };

    return check;
  };

  validatePrice(price: any): boolean {
    const regex = new RegExp('^\\d*[.]{0,1}\\d{0,2}$');
    const check = regex.test(price);

    if (!check) {
      this.addMessage = 'Please enter a valid price.';
      this.globalService.displayMsg('alert-danger', '#addMsg', '#addMsgContainer');
    };

    return true;
  };

  // =======================
  // || General Functions ||
  // =======================

  onCreateItem(): void {
    $('#addMsgContainer').css('display', 'none');
    const form = this.addItem.value;
    if (!this.validateName(form.name)) return;
    if (!this.validatePrice(form.price)) return;
    console.log('here')
    // validate form
    // parse price to be value in cents
    
    // this.itemService.createItem(this.addItem.value).subscribe(_res => {
    //   if (_res.status === 200) {
    //     this.addMessage = 'Item successfully created';
    //     this.globalService.displayMsg('alert-danger', 'alert-success', '#addMsg', '#addMsgContainer');
    //     // display success message
    //     // add item to list
    //     // clear form
    //     // remove modal
    //   } else {
    //     // display error message
    //   }
    // })
  };

  onCancelCreate(): void {
    this.clearForm();
    (<any>$('#createItemModal')).modal('hide');
    $('#addMsgContainer').css('display', 'none');
  };
}
