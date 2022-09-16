import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { GlobalService } from 'src/app/services/global.service';
import { StoreService } from 'src/app/services/store.service';
import { UserService } from 'src/app/services/user.service';

import { Store } from 'src/app/interfaces/store';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-delete-store',
  templateUrl: './delete-store.component.html',
  styleUrls: ['./delete-store.component.css']
})
export class DeleteStoreComponent implements OnInit, OnDestroy {
  @Input() targetStore!: Store;
  private subscriptions = new Subscription();
  private storeList?: Store[];
  private timeout?: number;
  deleteStoreMessage?: string;

  constructor(
    private globalService: GlobalService,
    private storeService: StoreService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.systemMsg.subscribe(_msg => this.deleteStoreMessage = _msg));
    this.subscriptions.add(this.storeService.storeList.subscribe(_list => this.storeList = _list));
    this.subscriptions.add(this.globalService.timeout.subscribe(_time => this.timeout = _time));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // =======================
  // || General Functions ||
  // =======================

  onConfirmDelete(): void {
    $('#deleteStoreBtn').prop('disabled', true);
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingTokenModal('#deleteStoreMsg', '#deleteStoreModal');
    const payload = {
      storeId: this.targetStore._id,
      users: this.targetStore.users
    };

    this.storeService.deleteStore(token, payload).subscribe(_res => {
      if (_res.status === 200) {
        this.userService.changeSystemMsg(_res.msg);
        this.globalService.displayMsg('alert-success', '#deleteStoreMsg');
        this.storeService.changeStoreList(this.globalService.filterList([this.targetStore], this.storeList!, 0));
        setTimeout(() => { (<any>$('#deleteStoreModal')).modal('hide') }, this.timeout);
      } else {
        this.userService.changeSystemMsg(_res.msg);
        this.globalService.displayMsg('alert-danger', '#deleteStoreMsg');
        $('#deleteStoreBtn').prop('disabled', false);
      };
    });
  };
}
