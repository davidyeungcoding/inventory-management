import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { GlobalService } from 'src/app/services/global.service';
import { StoreService } from 'src/app/services/store.service';
import { UserService } from 'src/app/services/user.service';

import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-remove-user',
  templateUrl: './remove-user.component.html',
  styleUrls: ['./remove-user.component.css']
})
export class RemoveUserComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  private activeUser?: User|null;
  private timeout?: number;
  removeUserMessage?: string;

  constructor(
    private globalService: GlobalService,
    private storeService: StoreService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.systemMsg.subscribe(_msg => this.removeUserMessage = _msg));
    this.subscriptions.add(this.userService.activeUser.subscribe(_user => this.activeUser = _user));
    this.subscriptions.add(this.globalService.timeout.subscribe(_time => this.timeout = _time));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ======================
  // || Helper Functions ||
  // ======================

  buildRemovalPayload(userId: string, storeId: string): any {
    return {
      _id: storeId,
      toChange: {
        [userId]: 'remove'
      }
    };
  };

  // =======================
  // || General Functions ||
  // =======================

  confirmRemoval(): void {
    $('#confirmRemovalBtn').prop('disabled', true);
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingTokenModal('#confirmRemovalMsg', '#confirmRemovalModal');
    const storeId = document.URL.substring(document.URL.lastIndexOf('/') + 1);
    const payload = this.buildRemovalPayload(this.activeUser!._id, storeId);

    this.storeService.updateStoreUsers(token, payload).subscribe(_store => {
      if (_store.status === 200) {
        if (_store.token) localStorage.setItem('token', _store.token);
        this.userService.changeSystemMsg('You have been removed from this location');
        this.globalService.displayMsg('alert-success', '#confirmRemovalMsg');
        
        setTimeout(() => { 
          (<any>$('#confirmRemovalModal')).modal('hide');
          this.globalService.redirectUser('store-list');
        }, this.timeout);
      } else {
        this.userService.changeSystemMsg(_store.msg);
        this.globalService.displayMsg('alert-danger', '#confirmRemovalMsg');
      };
    });
  };

}
