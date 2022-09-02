import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
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
  private accountType: any;
  manageUsers: User[] = [];
  manageUserMessage: string = '';
  filteredUserList: User[] = [];
  fullUserListError: string = '';
  editUserMessage: string = '';
  accountTypeForm = new FormGroup({
    _id: new FormControl(''),
    username: new FormControl(''),
    accountType: new FormControl('')
  });

  constructor(
    private globalService: GlobalService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.storeUsers.subscribe(_list => this.manageUsers = _list));
    this.subscriptions.add(this.userService.accountType.subscribe(_types => this.accountType = _types));
    this.getStoreUsers();
  }

  ngOnDestroy(): void {
    this.userService.changeStoreUsers([]);
    this.subscriptions.unsubscribe();
  }

  // ======================
  // || Helper Functions ||
  // ======================

  handleMissingToken(): void {
    this.manageUserMessage = this.globalService.missingTokenMsg;
    this.globalService.displayMsg('alert-danger', '#manageUserMsg');
    setTimeout(() => { this.userService.logout() }, this.globalService.timeoutLong);
  };

  compareAccountTypes(user: User): boolean {
    const target = user.accountType;
    if (this.accountType.admin) return true;
    if (this.accountType.manager) return target === 'admin' ? false : true;
    return target === 'general' ? true : false;
  };

  // =======================
  // || General Functions ||
  // =======================

  getStoreUsers(): void {
    const token = localStorage.getItem('token');
    if (!token) return this.handleMissingToken();
    const storeId = document.URL.substring(document.URL.lastIndexOf('/') + 1);

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
    const token = localStorage.getItem('token');
    if (!token) return this.handleMissingToken();
    $('#updateStoreUsersBtn').prop('disabled', false);
    $('#addUserMsgContainer').css('display', 'none');
    this.globalService.clearHighlight();
    this.userService.changeToChange({});

    this.userService.getFullUserList(token).subscribe(_list => {
      if (_list.status === 200) {
        this.filteredUserList = this.globalService.filterList(this.manageUsers, _list.msg, 0);
        (<any>$('#manageUserModal')).modal('show');
      } else {
        this.fullUserListError = _list.msg;
        this.globalService.displayMsg('alert-danger', '#addUserMsg');
      };
    });
  };

  onEditUser(user: User): void {
    const token = localStorage.getItem('token');
    if (!token) return this.handleMissingToken();
    $('#editUserAccountTypeBtn').prop('disabled', false);
    $('#editUserAccountTypeMsgContainer').css('display', 'none');

    if (!this.compareAccountTypes(user)) {
      $('#editUserAccountTypeBtn').prop('disabled', true);
      this.editUserMessage = 'Cannot change account type for users with higher permissions';
      this.globalService.displayMsg('alert-danger', '#editUserAccountTypeMsg');
    };
    
    this.accountTypeForm.setValue({
      _id: user._id,
      username: user.username,
      accountType: user.accountType
    });
    
    (<any>$('#editUserAccountTypeModal')).modal('show');
  };

  onRemoveUser(user: User): void {}

  onBack(): void {
    this.globalService.redirectUser('store-list');
  };
}
