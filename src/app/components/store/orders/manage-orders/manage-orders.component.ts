import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { GlobalService } from 'src/app/services/global.service';
import { StoreService } from 'src/app/services/store.service';
import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';

import { Store } from 'src/app/interfaces/store';
import { Order } from 'src/app/interfaces/order'

@Component({
  selector: 'app-manage-orders',
  templateUrl: './manage-orders.component.html',
  styleUrls: ['./manage-orders.component.css']
})
export class ManageOrdersComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  private ignoreKeys: string[] = [];
  private dateSort: boolean = true;
  private storeSort: boolean = true;
  private priceSort: boolean = true;
  manageOrdersMessage?: string;
  storeList?: Store[];
  selectedStoresObj: any = {};
  orderList: any[] = [];
  selectedOrder?: any;
  orderCount: number = 0;
  itemCount: number = 0;
  itemObj: any = {};
  ingredientCount: number = 0;
  ingredientObj: any = {};
  summaryTotal: string = '$0.00';
  summaryTarget: string = '';
  orderDetails = new FormGroup({
    month: new FormControl('', Validators.pattern('\\d{2}')),
    day: new FormControl('', Validators.pattern('\\d{2}')),
    year: new FormControl('', Validators.pattern('\\d{4}')),
    store: new FormArray(<any>[])
  });

  constructor(
    private globalService: GlobalService,
    private storeService: StoreService,
    private orderService: OrderService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.systemMsg.subscribe(_msg => this.manageOrdersMessage = _msg));
    this.subscriptions.add(this.globalService.ignoreKeys.subscribe(_list => this.ignoreKeys = _list));
    this.getStoreList();
    this.globalService.makeActiveNav('#navManageOrders');
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ==================
  // || Form Getters ||
  // ==================

  get month() { return this.orderDetails.get('month') };
  get day() { return this.orderDetails.get('day') };
  get year() { return this.orderDetails.get('year') };

  // ======================
  // || Helper Functions ||
  // ======================

  parseMonth(): string {
    const target = this.month!.value;

    return target === '01' ? ' (?:Jan) '
    : target === '02' ? ' (?:Feb) '
    : target === '03' ? ' (?:Mar) '
    : target === '04' ? ' (?:Apr) '
    : target === '05' ? ' (?:May) '
    : target === '06' ? ' (?:Jun) '
    : target === '07' ? ' (?:Jul) '
    : target === '08' ? ' (?:Aug) '
    : target === '09' ? ' (?:Sep) '
    : target === '10' ? ' (?:Oct) '
    : target === '11' ? ' (?:Nov) '
    : target === '12' ? ' (?:Dec) '
    : '\\s{1}[a-zA-Z]{3}\\s{1}';
  };

  buildSearchDate(): string {
    const month = this.parseMonth();
    const day = this.day!.value ? `${this.day!.value} ` : '\\d{2}\\s{1}';
    const year = this.year!.value ? `${this.year!.value} ` : '\\d{4}\\s{1}';
    return `${month}${day}${year}`;
  };

  buildStoreArray(): any[] {
    const target = Object.keys(this.selectedStoresObj);
    const temp: string[] = [];
    if (target.length) target.forEach(key => { if (this.selectedStoresObj[key]) temp.push(key) });
    if (!temp.length) this.storeList?.forEach(store => temp.push(store._id));
    return temp;
  };

  updateItemObj(list: any[]): void {
    list.forEach(item => {
      if (this.itemObj[item.itemId]) {
        this.itemObj[item.itemId].quantity += item.quantity;
      } else {
        this.itemObj[item.itemId] = {
          name: item.name,
          quantity: item.quantity
        };
      };
    });
  };

  updateIngredientObj(list: any[]): void {
    list.forEach(ingredient => {
      if (this.ingredientObj[ingredient.ingredientId]) {
        this.ingredientObj[ingredient.ingredientId].quantity += ingredient.quantity;
      } else {
        this.ingredientObj[ingredient.ingredientId] = {
          name: ingredient.name,
          quantity: ingredient.quantity
        };
      };
    });
  };

  parseOrderList(): void {
    this.orderCount = Object.keys(this.orderList).length;
    let total: any = 0;
    this.itemObj = {};
    this.itemCount = 0;
    this.ingredientObj = {};
    this.ingredientCount = 0;

    this.orderList.forEach(order => {
      this.updateItemObj(order.orderItems);
      this.updateIngredientObj(order.orderIngredients);
      order.totalValue = Number(order.orderTotal);
      total += order.totalValue;
      order.orderTotal = this.globalService.displayPrice(order.orderTotal);
      order.date = this.orderService.parseDateForDisplay(order.date);
    });
    
    this.itemCount = Object.keys(this.itemObj).length;
    this.ingredientCount = Object.keys(this.ingredientObj).length;
    total = String(total).length === 1 ? `00${total}`
    : String(total).length === 2 ? `0${total}`
    : total;
    this.summaryTotal = this.globalService.displayPrice(String(total));
  };

  changeSortIcon(elemId: string, direction: boolean): void {
    const current = direction ?  elemId : `${elemId}Reverse`;
    const next = direction ?  `${elemId}Reverse` : elemId;
    $(current).addClass('hide');
    $(next).removeClass('hide');
  };

  handleSortList(term: string, elemId: string): any {
    let temp = [...this.orderList];
    let direction;

    switch (term) {
      case 'date':
        direction = this.dateSort;
        this.changeSortIcon(elemId, direction);
        this.dateSort = !this.dateSort;
        temp = this.orderService.sortDate(temp, !direction);
        return temp;
      case 'store':
        direction = this.storeSort;
        this.changeSortIcon(elemId, direction);
        this.storeSort = !this.storeSort;
        break;
      case 'totalValue':
        direction = this.priceSort;
        this.changeSortIcon(elemId, direction);
        this.priceSort = !this.priceSort;
        break;
    };
      
    temp = this.orderService.mergeSort(temp, term, !direction);
    return temp;
  };

  // =======================
  // || General Functions ||
  // =======================

  getStoreList(): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#manageOrdersMsg');

    this.storeService.getStoreList(token).subscribe(_list => {
      if (_list.status === 200) {
        if (_list.token) localStorage.setItem('token', _list.token);
        this.storeList = _list.msg;

        if (!this.storeList!.length) {
          this.userService.changeSystemMsg('No stores found for your account');
          this.globalService.displayMsg('alert-light', '#manageOrdersMsg')
        };
      } else {
        this.userService.changeSystemMsg(_list.msg);
        this.globalService.displayMsg('alert-danger', _list.msg);
      };
    });
  };

  onDateKeyDown(event: any, current: string, next: string): void {
    const target = current === 'month' ? this.month
    : current === 'day' ? this.day
    : this.year;
    const keyCheck = this.ignoreKeys.includes(event.key) ? false : true;
    if (target!.value!.length === 2 && !target!.invalid && keyCheck && next) $(next).select();
  };

  onSelectStore(storeId: string): void {
    if (this.selectedStoresObj[storeId]) {
      this.selectedStoresObj[storeId] = false;
      $(`#orders${storeId}`).removeClass('btn-outline-selected');
      $(`#minusContainer${storeId}`).css('display', 'none');
      $(`#plusContainer${storeId}`).css('display', 'inline');
    } else {
      this.selectedStoresObj[storeId] = true;
      $(`#orders${storeId}`).addClass('btn-outline-selected');
      $(`#plusContainer${storeId}`).css('display', 'none');
      $(`#minusContainer${storeId}`).css('display', 'inline');
    };
  };

  onSearchOrders(): void {
    $('#manageOrdersBtn').prop('disabled', true);
    $('#manageOrdersMsgContainer').css('display', 'none');
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#manageOrdersMsg');
    
    if (!this.month?.valid || !this.day?.valid || !this.year?.valid) {
      $('#manageOrdersBtn').prop('disabled', false);
      return;
    };

    const searchDate = this.month.value || this.day.value || this.year.value ?  this.buildSearchDate() : '';
    const payload = {
      stores: this.buildStoreArray(),
      searchDate: searchDate
    };

    this.orderService.searchByDateAndStore(token, payload).subscribe(_orderList => {
      if (_orderList.status === 200) {
        if (_orderList.token) localStorage.setItem('token', _orderList.token);
        this.orderList = _orderList.msg;

        if (!this.orderList.length) {
          this.userService.changeSystemMsg('No orders found');
          this.globalService.displayMsg('alert-light', '#manageOrdersMsg');
        };

        this.parseOrderList();
      } else {
        this.userService.changeSystemMsg(_orderList.msg);
        this.globalService.displayMsg('alert-danger', '#manageOrdersMsg');
      };

      $('#manageOrdersBtn').prop('disabled', false);
    });
  };

  onSortOrders(term: string): void {
    if (!this.orderList.length) return;
    const elemId = `#${term}OrderList`;
    this.orderList = this.handleSortList(term, elemId);
  };

  onOrderDetails(order: Order): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#manageOrdersMsg');
    (<any>$('#orderDetailsModal')).modal('show');
    this.selectedOrder = order;

    this.selectedOrder.orderItems.forEach((item: any, i: number) => {
      this.selectedOrder!.orderItems[i].displayCost = this.globalService.displayPrice(item.totalCost);
    });
  };

  onShowSummaryDetails(target: string): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#manageOrdersMsg');
    (<any>$('#summaryModal')).modal('show');
    this.summaryTarget = `${target.substring(0, 1).toUpperCase()}${target.substring(1)}`;
    const current = target === 'item' ? '#itemSummaryTable' : '#ingredientSummaryTable';
    $('.summary-table-container').css('display', 'none');
    $(current).css('display', 'inline');
  };
}
