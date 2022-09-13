import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { GlobalService } from 'src/app/services/global.service';
import { StoreService } from 'src/app/services/store.service';
import { UserService } from 'src/app/services/user.service';

import { Store } from 'src/app/interfaces/store';

@Component({
  selector: 'app-store-list',
  templateUrl: './store-list.component.html',
  styleUrls: ['./store-list.component.css']
})
export class StoreListComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  targetStore?: Store;
  storeListMessage: string = '';
  storeList: Store[] = [];
  accountType: any;
  createStore = new FormGroup({
    name: new FormControl('', Validators.required),
    street: new FormControl('', Validators.required),
    city: new FormControl('', Validators.required),
    state: new FormControl('', Validators.required),
    zip: new FormControl('', Validators.required)
  });

  constructor(
    private globalService: GlobalService,
    private storeService: StoreService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.accountType.subscribe(_types => this.accountType = _types));
    this.subscriptions.add(this.userService.systemMsg.subscribe(_msg => this.storeListMessage = _msg));
    this.subscriptions.add(this.storeService.storeList.subscribe(_list => this.storeList = _list));
    this.getStoreList();
  }

  ngOnDestroy(): void {
    this.storeService.changeStoreList([]);
    this.subscriptions.unsubscribe();
  }

  // to do: add 'Back to Top' button

  // ======================
  // || Helper Functions ||
  // ======================

  clearForm(): void {
    this.createStore.setValue({
      name: '',
      street: '',
      city: '',
      state: '',
      zip: ''
    });
  };

  // =======================
  // || General Functions ||
  // =======================

  getStoreList(): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#storeMsg');

    this.storeService.getStoreList(token).subscribe(_list => {
      if (_list.status === 200) {
        if (_list.token) localStorage.setItem('token', _list.token);

        if (_list.msg.length) {
          this.storeService.changeStoreList(_list.msg)
        } else {
          this.storeService.changeStoreList([]);
          this.userService.changeSystemMsg('No stores found for your account');
          this.globalService.displayMsg('alert-danger', '#storeMsg');
        };
      } else {
        this.userService.changeSystemMsg(_list.msg);
        this.globalService.displayMsg('alert-danger', '#storeMsg');
      };
    });
  };

  onStoreActionRedirect(route: string, storeId: string): void {
    // to do: remove aria-current from navbar option
    // to do: remove .active class from navbar option
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#storeMsg');
    this.globalService.storeActionRedirect(route, storeId);
  };

  onDeleteStore(store: Store): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#storeMsg');
    $('#deleteStoreBtn').prop('disabled', false);
    $('#deleteStoreMsgContainer').css('display', 'none');
    this.targetStore = store;
    (<any>$('#deleteStoreModal')).modal('show');
  };

  onCreateStore(): void {
    $('#storeMsgContainer').css('display', 'none');
    const token = localStorage.getItem('token');

    if (!token) {
      $('#createLocation').prop('disabled', true);
      return this.userService.handleMissingToken('#storeMsg');
    };

    $('#createStoreBtn').prop('disabled', false);
    $('#createStoreMsgContainer').css('display', 'none');
    this.storeService.changeSelectedState('---Select a State---');
    this.clearForm();
    (<any>$('#createStoreModal')).modal('show');
  };

  onGoToTop(): void {
    $(window).scrollTop(0);
  };
}
