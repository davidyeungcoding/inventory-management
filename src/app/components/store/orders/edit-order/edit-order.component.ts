import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { GlobalService } from 'src/app/services/global.service';
import { StoreService } from 'src/app/services/store.service';
import { ItemService } from 'src/app/services/item.service';
import { UserService } from 'src/app/services/user.service';

import { Ingredient } from 'src/app/interfaces/ingredient';
import { Item } from 'src/app/interfaces/item';

@Component({
  selector: 'app-edit-order',
  templateUrl: './edit-order.component.html',
  styleUrls: ['./edit-order.component.css']
})
export class EditOrderComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  private quantityTimeout: any = null;
  private priceArray: number[] = [];
  private ingredientArray: any[] = [];
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
      storeId: new FormControl(`${document.URL.substring(document.URL.lastIndexOf('/') + 1)}`)
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
  get orderIngredients() { return this.order.controls.orderDetails.get('orderIngredients') as FormArray};
  get totalCost() { return this.order.controls.orderDetails.get('totalCost') };

  // ======================
  // || Helper Functions ||
  // ======================

  validateOrderDate(): boolean {
    return !this.month?.errors && !this.day?.errors && !this.year?.errors;
  };

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
    let temp = this.convertStringPrice(total.toString());
    temp = this.displayPrice(temp);
    this.order.controls.orderDetails.patchValue({ totalCost: this.convertStringPrice(temp) });
  };

  invalidatePrice(index: number): void {
    this.priceArray[index] = 0;
    this.lineItems.controls[index].patchValue({ totalCost: '-----' });
  };

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

  validateOrder(): void {
    const order = this.lineItems.value;
    let toPurge: number[] = [];
    
    for (let i = order.length - 1; i >= 0; i--) {
      if (order[i].quantity === '' || order[i].quantity === '0'
      || isNaN(order[i].quantity) || !order[i].orderItem._id) toPurge.push(i);
    };

    if (toPurge.length) toPurge.forEach(index => this.lineItems.removeAt(index));
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
    if (!$(`#${index}Required`)[0].classList.contains('hide')) $(`#${index}Required`).addClass('hide');
    if (!$(`#${index}Pattern`)[0].classList.contains('hide')) $(`#${index}Pattern`).addClass('hide');
    const quantityControl = item.controls.quantity;
    if (quantityControl.invalid && (quantityControl.dirty || quantityControl.touched)) return this.handleQuantityError(item, index);
    if (!item.value.orderItem._id) return;
    const itemPrice = item.value.orderItem.price;
    const quantity = this.lineItems.value[index].quantity;
    if (this.quantityTimeout != null) clearTimeout(this.quantityTimeout);

    this.quantityTimeout = setTimeout(() => {
      this.updateIngredientQuantity(Number(quantity), index);
      if (!itemPrice) return;
      if (!quantity) return this.invalidatePrice(index);
      const calculatedPrice = this.calculateQuantityPrice(itemPrice, quantity, index);
      this.lineItems.controls[index].patchValue({ totalCost: calculatedPrice });
    }, 500);
  };

  onSelectItem(item: Item, index: number): void {
    const quantity = Number(this.lineItems.value[index].quantity);
    const price = quantity ? this.calculateQuantityPrice(item.price, quantity, index) : '-----';
    this.selectIngredients(item.ingredients, quantity, index);
    
    this.lineItems.controls[index].patchValue({ 
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
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#editOrderMsg');
    if (!this.validateOrderDate()) return;
    const year = Number(this.year?.value);
    const month = Number(this.month?.value) - 1;
    const day = Number(this.day?.value);
    const formDate = new Date(year, month, day);
    this.validateOrder();
    console.log(this.order.value)
  };
}
