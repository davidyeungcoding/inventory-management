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
  manageOrdersMessage?: string;
  storeList?: Store[];
  selectedStoresObj: any = {};
  orderList?: Order[];
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
    target.length ? target.forEach(key => { if (this.selectedStoresObj[key]) temp.push(key) })
    : this.storeList?.forEach(store => temp.push(store._id));
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
      $(`#minusContainer${storeId}`).css('display', 'none');
      $(`#plusContainer${storeId}`).css('display', 'inline');
    } else {
      this.selectedStoresObj[storeId] = true;
      $(`#plusContainer${storeId}`).css('display', 'none');
      $(`#minusContainer${storeId}`).css('display', 'inline');
    };
  };

  onSearchOrders(): void {
    $('#manageOrdersBtn').prop('disabled', true);
    $('#manageOrdersMsgContainer').css('display', 'none');
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#manageOrdersMsg');
    if (!this.month?.valid || !this.day?.valid || !this.year?.valid) return;
    const searchDate = this.month.value || this.day.value || this.year.value ?  this.buildSearchDate() : '';
    
    const payload = {
      stores: this.buildStoreArray(),
      searchDate: searchDate
    };

    this.orderService.searchByDateAndStore(token, payload).subscribe(_orderList => {
      if (_orderList.status === 200) {
        if (_orderList.token) localStorage.setItem('token', _orderList.token);
        this.orderList = _orderList.msg;
        console.log(this.orderList)
      } else {
        this.userService.changeSystemMsg(_orderList.msg);
        this.globalService.displayMsg('alert-danger', '#manageOrdersMsg');
      };

      $('#manageOrdersBtn').prop('disabled', false);
    });
  };
}
