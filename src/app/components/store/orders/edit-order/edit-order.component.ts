import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { GlobalService } from 'src/app/services/global.service';
import { OrderService } from 'src/app/services/order.service';
import { ItemService } from 'src/app/services/item.service';
import { UserService } from 'src/app/services/user.service';

import { Ingredient } from 'src/app/interfaces/ingredient';
import { Order } from 'src/app/interfaces/order';
import { Item } from 'src/app/interfaces/item';

@Component({
  selector: 'app-edit-order',
  templateUrl: './edit-order.component.html',
  styleUrls: ['./edit-order.component.css']
})
export class EditOrderComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  private quantityTimeout: any = null;
  private dateTimeout: any = null;
  private priceArray: number[] = [];
  private ingredientArray: any[] = [];
  previousOrders: Order[] = [];
  hours?: string[];
  selectedHour: string = '12';
  minutes?: string[];
  selectedMinute: string = '00';
  timeModifier?: string[];
  selectedTimeModifier: string = 'AM';
  formDate?: Date;
  searchDate?: string;
  displayDate?: string;
  ingredientObj: any = {};
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
      totalCost: new FormControl('$0.00'),
      dBPrice: new FormControl('000')
    })
  });

  constructor(
    private globalService: GlobalService,
    private orderService: OrderService,
    private itemService: ItemService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.systemMsg.subscribe(_msg => this.editOrderMessage = _msg));
    this.subscriptions.add(this.itemService.itemList.subscribe(_list => this.fullItemList = _list));
    this.subscriptions.add(this.globalService.hours.subscribe(_hours => this.hours = _hours));
    this.subscriptions.add(this.globalService.minutes.subscribe(_minutes => this.minutes = _minutes));
    this.subscriptions.add(this.globalService.timeModifier.subscribe(_timeModifier => this.timeModifier = _timeModifier));
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
  get orderIngredients() { return this.order.controls.orderDetails.get('orderIngredients') as FormArray};
  get totalCost() { return this.order.controls.orderDetails.get('totalCost') };

  // ======================
  // || Helper Functions ||
  // ======================

    // ==========
    // || Date ||
    // ==========

  setDate(): void {
    const hour = this.selectedTimeModifier === 'AM' && this.selectedHour === '12' ? 0
    : this.selectedTimeModifier === 'AM' ? Number(this.selectedHour)
    : this.selectedTimeModifier === 'PM' && this.selectedHour === '12' ? 12
    : Number(this.selectedHour) + 12;
    this.formDate = new Date(Number(this.year?.value), Number(this.month?.value) - 1, Number(this.day?.value), hour, Number(this.selectedMinute));
    const temp = this.formDate.toString().split(' ');
    temp[4] = hour === 0 ? `12${temp[4].substring(2)}`
    : hour > 12 ? `${hour - 12}${temp[4].substring(2)}`
    : temp[4];
    this.displayDate = `${temp[0]}, ${temp[1]}. ${temp[2]}, ${temp[4]} ${this.selectedTimeModifier}`;
  };

  onSelectTime(target: string, value: string): void {
    target === 'hour' ? this.selectedHour = value
    : target === 'minute' ? this.selectedMinute = value
    : this.selectedTimeModifier = value;
    if (this.validateOrderDate()) this.setDate();
  };

  activateDate(): void {
    this.month?.markAsTouched();
    this.day?.markAsTouched();
    this.year?.markAsTouched();
  };

  checkSameDate(): boolean {
    if (!this.formDate || !this.searchDate) return false;
    const regex = new RegExp(this.searchDate.split('-').join(' '));
    return regex.test(this.formDate.toString());
  };

  searchOrdersByDate(): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#editOrderMsg');
    if (this.checkSameDate()) return;
    this.searchDate = this.formDate!.toString().split(' ', 4).join('-');
    const payload = {
      date: this.searchDate,
      storeId: document.URL.substring(document.URL.lastIndexOf('/') + 1)
    };

    this.orderService.searchByDate(token, payload).subscribe(_orders => {
      if (_orders.status === 200) {
        if (_orders.token) localStorage.setItem('token', _orders.token);
        this.previousOrders = _orders.msg;
      } else {
        this.userService.changeSystemMsg(_orders.msg);
        this.globalService.displayMsg('alert-danger', '#editOrderMsg');
      };
    });
  };

    // ===========
    // || Price ||
    // ===========

  convertStringPrice(price: string): string {
    return price.length === 1 ? `00${price}`
    : price.length === 2 ? `0${price}`
    : price;
  };

  displayPrice(price: string): string {
    return `$${price.substring(0, price.length - 2)}.${price.substring(price.length - 2)}`;
  };

  calculateQuantityPrice(price: string, quantity: number, index: number): string {
    const start = price.substring(1, price.length - 3);
    const end = price.substring(price.length - 2);
    let calculatedPrice = (Number(`${start}${end}`) * quantity).toString();
    calculatedPrice = this.convertStringPrice(calculatedPrice);
    this.calculateTotal(calculatedPrice, index);
    this.lineItems.controls[index].patchValue({ databasePrice: calculatedPrice });
    return this.displayPrice(calculatedPrice);
  };

  removeFromTotal(index: number): void {
    this.priceArray.splice(index, 1);
    const total = this.priceArray.length ? this.priceArray.reduce((previous, current) => previous + current) : 0;
    let temp = this.convertStringPrice(total.toString());
    temp = this.displayPrice(temp);
    this.order.controls.orderDetails.patchValue({ totalCost: this.convertStringPrice(temp) });
  };

  calculateTotal(price: string, index: number): void {
    this.priceArray[index] = Number(price);
    const total = this.priceArray.reduce((previous, current) => previous + current);
    const dBPrice = this.convertStringPrice(total.toString());
    const totalCost = this.displayPrice(dBPrice);
    this.order.controls.orderDetails.patchValue({ totalCost: totalCost, dBPrice: dBPrice });
  };

  invalidatePrice(index: number): void {
    this.priceArray[index] = 0;
    this.lineItems.controls[index].patchValue({ totalCost: '-----' });
  };

    // =================
    // || Ingredients ||
    // =================

  updateIngredientObj(difference: number, index: number): void {
    const ingredients = this.ingredientArray[index].ingredients;
    if (ingredients.length === 0) return;
    
    ingredients.forEach((ingredient: any) => {
      const objTarget = this.ingredientObj[ingredient._id];
      objTarget ? this.ingredientObj[ingredient._id].quantity += difference
      : this.ingredientObj[ingredient._id] = { name: ingredient.name, quantity: difference };
      if (this.ingredientObj[ingredient._id] && !this.ingredientObj[ingredient._id].quantity) delete this.ingredientObj[ingredient._id];
    });
  };

  selectIngredients(ingredients: Ingredient[], quantity: number, index: number): void {
    const parsedQuantity = quantity ? quantity : 0;
    if (this.ingredientArray[index]) this.updateIngredientObj(-this.ingredientArray[index].quantity, index);
    this.ingredientArray[index] = { ingredients: ingredients, quantity: parsedQuantity };
    if (!quantity || isNaN(quantity)) return;
    
    ingredients?.forEach(ingredient => {
      this.ingredientObj[ingredient._id] ? this.ingredientObj[ingredient._id].quantity += parsedQuantity
      : this.ingredientObj[ingredient._id] = { name: ingredient.name, quantity: parsedQuantity };
    });
  };

    // ==============
    // || Quantity ||
    // ==============

  updateIngredientQuantity(quantity: number, index: number): void {
    if (quantity === this.ingredientArray[index].quantity) return;
    const difference = quantity - this.ingredientArray[index].quantity;
    this.updateIngredientObj(difference, index);
    this.ingredientArray[index].quantity = quantity;
  };

  handleQuantityError(item: any, index: number): void {
    const quantityControl = item.controls.quantity;
    if (quantityControl.errors['required']) $(`#${index}Required`).removeClass('hide');
    if (quantityControl.errors['pattern']) $(`#${index}Pattern`).removeClass('hide');
    if (!item.controls.orderItem.value._id) return;
    this.calculateTotal('0', index);
    this.updateIngredientObj(-this.ingredientArray[index].quantity, index);
    this.ingredientArray[index].quantity = 0;
    this.invalidatePrice(index);
  };

    // ==============
    // || Checkout ||
    // ==============

  validateOrderDate(): boolean {
    return !this.month?.errors && !this.day?.errors && !this.year?.errors;
  };

  validateOrder(): void {
    const order = this.lineItems.value;
    let toPurge: number[] = [];
    
    for (let i = order.length - 1; i >= 0; i--) {
      if (order[i].quantity === '' || order[i].quantity === '0'
      || isNaN(order[i].quantity) || !order[i].orderItem._id) toPurge.push(i);
    };

    if (toPurge.length) toPurge.forEach(index => this.lineItems.removeAt(index));
  };

  parseIngredientsForPayload(): any[] {
    const ingredients: any[] = [];

    for (const key in this.ingredientObj) {
      ingredients.push({
        quantity: Number(this.ingredientObj[key].quantity),
        orderIngredient: key
      });
    };

    return ingredients;
  };

  parseOrderItemsForPayload(): any[] {
    const orderItems: any[] = [];

    this.lineItems.value.forEach((order: any) => {
      orderItems.push({
        quantity: order.quantity,
        orderItem: order.orderItem._id,
        totalCost: order.databasePrice
      });
    });

    return orderItems;
  };

  buildPayload(): any {
    return {
      date: this.formDate?.toString(),
      orderItems: this.parseOrderItemsForPayload(),
      orderIngredients: this.parseIngredientsForPayload(),
      orderTotal: this.order.controls.orderDetails.value.dBPrice,
      store: `${document.URL.substring(document.URL.lastIndexOf('/') + 1)}`
    };
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

  onDateKeyDown(event: any, current: string, next: string|null = null): void {
    const target = current === 'month' ? this.month
    : current === 'day' ? this.day
    : this.year;
    const keyCheck = event.key === 'Backspace' || event.key === 'Delete' ? false : true;
    if (!target!.invalid && keyCheck && next) $(next).focus();
    if (this.dateTimeout !== null) clearTimeout(this.dateTimeout);

    this.dateTimeout = setTimeout(() => {
      if (this.validateOrderDate()) {
        this.setDate();
        this.searchOrdersByDate();
      };
    }, 500);
  };

  onAddItem(): void {
    const lineItem = new FormGroup({
      quantity: new FormControl(1, Validators.pattern('^\\d+$')),
      orderItem: new FormControl(<Item>{}),
      totalCost: new FormControl(''),
      databasePrice: new FormControl('')
    });

    this.lineItems.push(lineItem);
  };

  onChangeQuantity(item: any, index: number): void {
    if (!$(`#${index}Required`)[0].classList.contains('hide')) $(`#${index}Required`).addClass('hide');
    if (!$(`#${index}Pattern`)[0].classList.contains('hide')) $(`#${index}Pattern`).addClass('hide');
    const quantityControl = item.controls.quantity;
    if (quantityControl.invalid && (quantityControl.dirty || quantityControl.touched)) return this.handleQuantityError(item, index);
    if (!item.value.orderItem._id) return;
    const itemPrice = item.value.orderItem.price;
    const quantity = Number(this.lineItems.value[index].quantity);
    if (this.quantityTimeout !== null) clearTimeout(this.quantityTimeout);

    this.quantityTimeout = setTimeout(() => {
      this.updateIngredientQuantity(Number(quantity), index);
      if (!itemPrice) return;
      if (!quantity) return this.invalidatePrice(index);
      const calculatedPrice = this.calculateQuantityPrice(itemPrice, quantity, index);
      this.lineItems.controls[index].patchValue({ quantity: Number(quantity), totalCost: calculatedPrice });
    }, 500);
  };

  onSelectItem(item: Item, index: number): void {
    const quantity = Number(this.lineItems.value[index].quantity);
    const price = quantity ? this.calculateQuantityPrice(item.price, quantity, index) : '-----';
    this.selectIngredients(item.ingredients, quantity, index);
    
    this.lineItems.controls[index].patchValue({
      quantity: quantity,
      orderItem: item,
      totalCost: price
    });
  };
  
  onRemoveItem(index: number): void {
    if (this.ingredientArray[index]) {
      this.updateIngredientObj(-this.ingredientArray[index].quantity, index);
      this.ingredientArray.splice(index, 1);
    };

    this.lineItems.removeAt(index);
    this.removeFromTotal(index);
  };

  onSubmitOrder(): void {
    $('#editOrderBtn').prop('disabled', true);
    this.parseOrderItemsForPayload()
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#editOrderMsg');
    this.activateDate();

    if (!this.validateOrderDate()) {
      $('#editOrderBtn').prop('disabled', false);
      return;
    };

    this.validateOrder();
    const payload = this.buildPayload();

    this.orderService.createOrder(token, payload).subscribe(_order => {
      if (_order.status === 201) {
        if (_order.token) localStorage.setItem('token', _order.token);
        this.userService.changeSystemMsg('Order created');
        this.globalService.displayMsg('alert-success', '#editOrderMsg');
      } else {
        this.userService.changeSystemMsg(_order.msg);
        this.globalService.displayMsg('alert-danger', '#editOrderMsg');
      };

      $('#editOrderBtn').prop('disabled', false);
    });
  };
}
