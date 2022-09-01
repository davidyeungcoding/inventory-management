import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { GlobalService } from 'src/app/services/global.service';
import { UserService } from 'src/app/services/user.service';

import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-manage-user',
  templateUrl: './manage-user.component.html',
  styleUrls: ['./manage-user.component.css']
})
export class ManageUserComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  manageUsers: User[] = [];
  manageUserMessage: string = '';
  filteredUserList: User[] = [];
  fullUserListError: string = '';

  constructor(
    private globalService: GlobalService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.storeUsers.subscribe(_list => this.manageUsers = _list));
    this.getStoreUsers();
  }

  ngOnDestroy(): void {
    this.userService.changeStoreUsers([]);
    this.subscriptions.unsubscribe();
  }

  // =======================
  // || General Functions ||
  // =======================

  getStoreUsers(): void {
    const token = localStorage.getItem('token');
    const storeId = document.URL.substring(document.URL.lastIndexOf('/') + 1);
    if (!token) return this.userService.logout();

    this.userService.getStoreUsers(token, storeId).subscribe(_list => {
      if (_list.status === 200) {
        this.userService.changeStoreUsers(_list.msg);
      } else {
        this.userService.changeStoreUsers([]);
        this.manageUserMessage = 'No users found for this location';
        this.globalService.displayMsg('alert-danger', '#manageUserMsg');
      };
    });
  };

  getFullUserList(): void {
    $('#addUserMsgContainer').css('display', 'none');
    const token = localStorage.getItem('token');
    if (!token) return this.userService.logout();
    this.globalService.clearHighlight();
    this.userService.changeToChange({});

    this.userService.getFullUserList(token).subscribe(_list => {
      if (_list.status === 200) {
        this.filteredUserList = this.globalService.filterList(this.manageUsers, _list.msg, 0);
        (<any>$('#addUserModal')).modal('show');
      } else {
        this.fullUserListError = _list.msg;
        this.globalService.displayMsg('alert-danger', '#addUserMsg');
      };
    });
  };

  onBack(): void {
    this.globalService.redirectUser('store-list');
  };
}
