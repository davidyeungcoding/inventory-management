import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { GlobalService } from 'src/app/services/global.service';
import { StoreService } from 'src/app/services/store.service';
import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';

import { Store } from 'src/app/interfaces/store';

@Component({
  selector: 'app-manage-orders',
  templateUrl: './manage-orders.component.html',
  styleUrls: ['./manage-orders.component.css']
})
export class ManageOrdersComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  manageOrdersMessage?: string;
  storeList?: Store[];
  selectedStoresArray: string[] = [];
  selectedStoresObj: any = {};
  orderDetails = new FormGroup({
    month: new FormControl(''),
    day: new FormControl(''),
    year: new FormControl(''),
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

  onSelectStore(storeId: string): void {
    // this.selectedStoresObj[storeId] = this.selectedStoresObj[storeId] ? false : true;
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
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#managerOrdersMsg');
    console.log(this.orderDetails.value);
  };
}
