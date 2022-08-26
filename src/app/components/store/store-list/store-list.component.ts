import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from 'src/app/interfaces/store';

import { GlobalService } from 'src/app/services/global.service';
import { StoreService } from 'src/app/services/store.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-store-list',
  templateUrl: './store-list.component.html',
  styleUrls: ['./store-list.component.css']
})
export class StoreListComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  storeListMessage: string = '';
  storeList: Store[] = [];

  constructor(
    private globalService: GlobalService,
    private storeService: StoreService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.storeService.storeList.subscribe(_list => this.storeList = _list));
    this.getStoreList();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // =======================
  // || General Functions ||
  // =======================

  getStoreList(): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.logout();

    this.storeService.getStoreList(token).subscribe(_list => {
      if (_list.status === 200) {
        if (_list.token) localStorage.setItem('token', _list.token);

        if (_list.msg.length) {
          this.storeService.changeStoreList(_list.msg)
        } else {
          this.storeListMessage = 'No stores found for your account';
          this.globalService.displayMsg('alert-danger', '#storeMsg', '#storeMsgContainer');
        };
      } else {
        this.storeListMessage = _list.msg;
        this.globalService.displayMsg('alert-danger', '#storeMsg', '#storeMsgContainer');
      };
    });
  };

  onRedirect(destination: string): void {
    this.globalService.redirectUser(destination);
  };
}
