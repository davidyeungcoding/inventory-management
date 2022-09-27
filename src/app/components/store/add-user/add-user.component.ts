import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { GlobalService } from 'src/app/services/global.service';
import { StoreService } from 'src/app/services/store.service';
import { UserService } from 'src/app/services/user.service';

import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit, OnDestroy {
  @Input() filteredUserList!: User[];
  @Input() storeUsers!: User[];
  @Input() toChange?: any;
  private subscriptions = new Subscription();
  private timeout?: number;
  addUserMessage!: string;
  

  constructor(
    private globalService: GlobalService,
    private storeService: StoreService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.systemMsg.subscribe(_msg => this.addUserMessage = _msg));
    this.subscriptions.add(this.globalService.timeout.subscribe(_time => this.timeout = _time));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ======================
  // || Helper Functions ||
  // ======================

  changeSelected(id: string, action: string): void {
    this.toChange[id] ? delete this.toChange[id] : this.toChange[id] = action;
  };

  handleNoChanges(): void {
    this.userService.changeSystemMsg('No changes detected');
    this.globalService.displayMsg('alert-danger', '#addUserMsg');
    $('#updateStoreUsersBtn').prop('disabled', false);
  };

  // =======================
  // || General Functions ||
  // =======================

  toRemove(user: User): void {
    this.globalService.highlight(user._id, this.toChange);
    this.changeSelected(user._id, 'remove');
  };

  toAdd(user: User): void {
    this.globalService.highlight(user._id, this.toChange);
    this.changeSelected(user._id, 'add');
  };

  onUpdateStoreUsers(): void {
    $('#updateStoreUsersBtn').prop('disabled', true);
    $('#addUserMsgContainer').css('display', 'none');
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingTokenModal('#addUserMsg', '#manageUserModal');
    const storeId = document.URL.substring(document.URL.lastIndexOf('/') + 1);
    if (!Object.keys(this.toChange).length) return this.handleNoChanges();

    const payload = {
      _id: storeId,
      toChange: this.toChange
    };

    this.storeService.updateStoreUsers(token, payload).subscribe(_store => {
      if (_store.status === 200) {
        if (_store.token) localStorage.setItem('token', _store.token);
        this.userService.changeSystemMsg('Store users have been updated');
        this.globalService.displayMsg('alert-success', '#addUserMsg');
        this.globalService.sortList(_store.msg.users, 'username');
        this.userService.changeStoreUsers(_store.msg.users);
        setTimeout(() => { (<any>$('#manageUserModal')).modal('hide') }, this.timeout);
      } else {
        this.userService.changeSystemMsg(_store.msg);
        this.globalService.displayMsg('alert-danger', '#addUserMsg');
        $('#updateStoreUsersBtn').prop('disabled', false);
      };
    });
  };
}
