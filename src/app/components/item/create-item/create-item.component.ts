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

  parsePrice(price: string): string {
    const index = price.indexOf('.');
    const start = price.substring(0, index);
    const end = price.substring(index + 1);
    if (index < 0) return price.length > 0 ? `${price}00` : '000';
    if (index === price.length - 1) return price.length > 1 ? `${start}00` : '000';
    if (index === price.length - 2) return price.length > 2 ? `${start}${end}0` : `0${end}0`;
    return start.length ? `${start}${end}` : `0${end}`;
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
    const form = this.addItem.value;
    // handle problem with exiting after failed validation
    if (!this.validateName(form.name)) return;
    if (!this.validatePrice(form.price)) return;
    $('#createItemBtn').prop('disabled', true);
    form.price = this.parsePrice(form.price!);
    
    this.itemService.createItem(form).subscribe(_res => {
      if (_res.status === 200) {
        this.addMessage = 'Item successfully created';
        this.globalService.displayMsg('alert-success', '#addMsg', '#addMsgContainer');
        this.addItemToList(_res.msg);
        
        setTimeout(() => {
          this.clearForm();
          $('#createItemBtn').prop('disabled', false);
          (<any>$('#createItemModal')).modal('hide');
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
    $('#createItemBtn').prop('disabled', false);
    (<any>$('#createItemModal')).modal('hide');
    $('#addMsgContainer').css('display', 'none');
  };
}
