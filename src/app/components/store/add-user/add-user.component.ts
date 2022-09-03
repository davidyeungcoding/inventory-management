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
  @Input() addUserMessage!: string;
  @Input() storeUsers!: User[];
  private subscriptions = new Subscription();
  private toChange: any = {};
  

  constructor(
    private globalService: GlobalService,
    private storeService: StoreService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.toChange.subscribe(_obj => this.toChange = _obj));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ======================
  // || Helper Functions ||
  // ======================

  changeSelected(id: string, action: string): void {
    const temp = {...this.toChange};
    temp[id] ? delete temp[id] : temp[id] = action;
    this.userService.changeToChange(temp);
  };

  handleMissingToken(): void {
    this.addUserMessage = this.globalService.missingTokenMsg;
    this.globalService.displayMsg('alert-danger', '#addUserMsg');
    
    setTimeout(() => {
      (<any>$('#manageUserModal')).modal('hide');
      this.userService.logout();
    }, this.globalService.timeoutLong);
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
    if (!token) return this.handleMissingToken();
    const storeId = document.URL.substring(document.URL.lastIndexOf('/') + 1);

    if (!Object.keys(this.toChange).length) {
      this.addUserMessage = 'No changes detected';
      this.globalService.displayMsg('alert-danger', '#addUserMsg');
      $('#updateStoreUsersBtn').prop('disabled', false);
      return;
    };

    const payload = {
      _id: storeId,
      toChange: this.toChange
    };

    this.storeService.updateStoreUsers(token, payload).subscribe(_store => {
      if (_store.status === 200) {
        if (_store.token) localStorage.setItem('token', _store.token);
        this.addUserMessage = 'Store users have been updated';
        this.globalService.displayMsg('alert-success', '#addUserMsg');
        this.userService.changeStoreUsers(_store.msg.users);
        setTimeout(() => { (<any>$('#manageUserModal')).modal('hide') }, this.globalService.timeout);
      } else {
        this.addUserMessage = _store.msg;
        this.globalService.displayMsg('alert-danger', '#addUserMsg');
        $('#updateStoreUsersBtn').prop('disabled', false);
      };
    });
  };

  onCancel(): void {
    (<any>$('#manageUserModal')).modal('hide');
    this.userService.changeToChange({});
  };
}
