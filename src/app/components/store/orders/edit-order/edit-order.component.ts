import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { GlobalService } from 'src/app/services/global.service';
import { StoreService } from 'src/app/services/store.service';
import { ItemService } from 'src/app/services/item.service';
import { UserService } from 'src/app/services/user.service';

import { Item } from 'src/app/interfaces/item';

@Component({
  selector: 'app-edit-order',
  templateUrl: './edit-order.component.html',
  styleUrls: ['./edit-order.component.css']
})
export class EditOrderComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  private quantityTimeout: any = null;
  editOrderMessage?: string;
  fullItemList?: Item[];
  order = new FormGroup({
    date: new FormGroup({
      month: new FormControl('', [Validators.required, Validators.pattern('\\d{2}')]),
      day: new FormControl('', [Validators.required, Validators.pattern('\\d{2}')]),
      year: new FormControl('', [Validators.required, Validators.pattern('\\d{4}')])
    }),
    orderDetails: new FormGroup({
      lineItems: new FormArray(<any>[]),
      orderIngredients: new FormArray(<any>[]),
      totalCost: new FormControl(''),
      storeId: new FormControl('')
    })
  });

  constructor(
    private globalService: GlobalService,
    private storeService: StoreService,
    private itemService: ItemService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.systemMsg.subscribe(_msg => this.editOrderMessage = _msg));
    this.subscriptions.add(this.itemService.itemList.subscribe(_list => this.fullItemList = _list));
    this.retrieveStoreItems();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ==================
  // || Form Getters ||
  // ==================

  get month() { return this.order.controls.date.get('month') };
  get day() { return this.order.controls.date.get('day') };
  get year() { return this.order.controls.date.get('year') };
  get lineItems() { return this.order.controls.orderDetails.get('lineItems') as FormArray };

  // ======================
  // || Helper Functions ||
  // ======================

  validateOrderDate(): boolean {
    return !this.month?.errors && !this.day?.errors && !this.year?.errors;
  };

  calculateQuantityPrice(price: string, quantity: number): string {
    const start = price.substring(1, price.length - 3);
    const end = price.substring(price.length - 2);
    let calculatedPrice = (Number(`${start}${end}`) * quantity).toString();
    calculatedPrice = calculatedPrice.length === 1 ? `00${calculatedPrice}`
    : calculatedPrice.length === 2 ? `0${calculatedPrice}`
    : calculatedPrice;
    return `$${calculatedPrice.substring(0, calculatedPrice.length - 2)}.${calculatedPrice.substring(calculatedPrice.length - 2)}`;
  };

  // =======================
  // || General Functions ||
  // =======================

  retrieveStoreItems(): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#editOrderMsg');
    const storeId = document.URL.substring(document.URL.lastIndexOf('/') + 1);

    this.itemService.getFullItemList(token, storeId).subscribe(_list => {
      if (_list.status === 200) {
        if (_list.token) localStorage.setItem('token', _list.token);
        this.globalService.convertPrice(_list.msg);
        this.globalService.sortList(_list.msg, 'name');
        this.itemService.changeItemList(_list.msg);
      } else {
        this.userService.changeSystemMsg(_list.msg);
        this.globalService.displayMsg('alert-danger', '#editOrderMsg');
      };
    });
  };

  onDateKeyup(current: string, next: string): void {
    const length = current === 'month' ? this.month?.value?.length
    : this.day?.value?.length;
    if (length === 2) $(next).focus();
  };

  onAddItem(): void {
    const lineItem = new FormGroup({
      quantity: new FormControl(1, Validators.pattern('^\\d+$')),
      orderItem: new FormControl(<Item>{}),
      totalCost: new FormControl('')
    });

    this.lineItems.push(lineItem);
  };

  onChangeQuantity(item: any, index: number): void {
    const itemPrice = item.value.orderItem.price;
    const quantity = this.lineItems.value[index].quantity;
    if (!itemPrice) return;
    if (this.quantityTimeout != null) clearTimeout(this.quantityTimeout);

    this.quantityTimeout = setTimeout(() => {
      // to do: error handling for quantity field
      if (!quantity) return;
      const calculatedPrice = this.calculateQuantityPrice(itemPrice, quantity);
      this.lineItems.controls[index].patchValue({ totalCost: calculatedPrice });
    }, 500);
  };

  onSelectItem(item: Item, index: number): void {
    const quantity = this.lineItems.value[index].quantity;
    const price = quantity ? this.calculateQuantityPrice(item.price, quantity) : '';
    this.lineItems.controls[index].patchValue({ 
      orderItem: item,
      totalCost: price
    });
  };
  
  onRemoveItem(i: number): void {};

  onSubmitOrder(): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#editOrderMsg');
    if (!this.validateOrderDate()) return;
    const year = Number(this.year?.value);
    const month = Number(this.month?.value) - 1;
    const day = Number(this.day?.value);
    const formDate = new Date(year, month, day);
    console.log(this.order.value)
  };
}
