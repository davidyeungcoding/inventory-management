import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { GlobalService } from 'src/app/services/global.service';
import { StoreService } from 'src/app/services/store.service';
import { UserService } from 'src/app/services/user.service';

import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-manage-user',
  templateUrl: './manage-user.component.html',
  styleUrls: ['./manage-user.component.css']
})
export class ManageUserComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  private activeUser?: User|null;
  private accountType: any;
  manageUsers: User[] = [];
  manageUserMessage?: string;
  filteredUserList: User[] = [];
  fullUserListError: string = '';
  accountTypeForm = new FormGroup({
    _id: new FormControl(''),
    username: new FormControl(''),
    accountType: new FormControl('')
  });

  constructor(
    private globalService: GlobalService,
    private storeService: StoreService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.systemMsg.subscribe(_msg => this.manageUserMessage = _msg));
    this.subscriptions.add(this.userService.accountType.subscribe(_types => this.accountType = _types));
    this.subscriptions.add(this.userService.storeUsers.subscribe(_list => this.manageUsers = _list));
    this.subscriptions.add(this.userService.activeUser.subscribe(_user => this.activeUser = _user));
    this.getStoreUsers();
  }

  ngOnDestroy(): void {
    this.userService.changeStoreUsers([]);
    this.subscriptions.unsubscribe();
  }

  // ======================
  // || Helper Functions ||
  // ======================

  compareAccountTypes(user: User): boolean {
    const target = user.accountType;
    if (this.accountType.admin) return true;
    if (this.accountType.manager) return target === 'admin' ? false : true;
    return target === 'general' ? true : false;
  };

  handlePermissions(user: User): void {
    const permission = this.compareAccountTypes(user);

    if (!permission) {
      $('#editUserAccountTypeBtn').prop('disabled', true);
      this.userService.changeSystemMsg('Cannot change account type for users with higher permissions');
      this.globalService.displayMsg('alert-danger', '#editUserAccountTypeMsg');
    };
  };

  handlePersonalAccount(target: any): void {
    if (this.activeUser!._id === target._id) {
      $('#editUserAccountTypeBtn').prop('disabled', true);
      this.userService.changeSystemMsg('Cannot modify your own account type');
      this.globalService.displayMsg('alert-danger', '#editUserAccountTypeMsg');
    };
  };

  handleRemovePersonal(): void {
    $('#confirmRemovalBtn').prop('disabled', false);
    $('#confirmRemovalMsgContainer').css('display', 'none');
    (<any>$('#confirmRemovalModal')).modal('show');
    return;
  };

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

  getStoreUsers(): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#manageUserMsg');
    const storeId = document.URL.substring(document.URL.lastIndexOf('/') + 1);

    this.userService.getStoreUsers(token, storeId).subscribe(_list => {
      if (_list.status === 200) {
        if (_list.token) localStorage.setItem('token', _list.token);
        this.userService.changeStoreUsers(_list.msg);
      } else {
        this.userService.changeStoreUsers([]);
        this.userService.changeSystemMsg('No users found for this location');
        this.globalService.displayMsg('alert-danger', '#manageUserMsg');
      };
    });
  };

  getFullUserList(): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#manageUserMsg');
    $('#updateStoreUsersBtn').prop('disabled', false);
    $('#addUserMsgContainer').css('display', 'none');
    $('#manageUserMsgContainer').css('display', 'none');
    this.globalService.clearHighlight();
    this.userService.changeToChange({});

    this.userService.getFullUserList(token).subscribe(_list => {
      if (_list.status === 200) {
        if (_list.token) localStorage.setItem('token', _list.token);
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
    if (!token) return this.userService.handleMissingToken('#manageUserMsg');
    $('#editUserAccountTypeBtn').prop('disabled', false);
    $('#editUserAccountTypeMsgContainer').css('display', 'none');
    $('#manageUserMsgContainer').css('display', 'none');
    this.handlePermissions(user);
    this.handlePersonalAccount(user);
    
    this.accountTypeForm.setValue({
      _id: user._id,
      username: user.username,
      accountType: user.accountType
    });
    
    (<any>$('#editUserAccountTypeModal')).modal('show');
  };

  onRemoveUser(user: User): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#manageUserMsg');
    const storeId = document.URL.substring(document.URL.lastIndexOf('/') + 1);
    if (this.activeUser!._id === user._id) return this.handleRemovePersonal();
    const payload = this.buildRemovalPayload(user._id, storeId);

    this.storeService.updateStoreUsers(token, payload).subscribe(_store => {
      if (_store.status === 200) {
        if (_store.token) localStorage.setItem('token', _store.token);
        this.userService.changeStoreUsers(_store.msg.users);
        this.userService.changeSystemMsg(`${user.username} has been removed`);
        this.globalService.displayMsg('alert-success', '#manageUserMsg');
      } else {
        this.userService.changeSystemMsg(_store.msg);
        this.globalService.displayMsg('alert-danger', '#manageUserMsg');
      };
    });
  };

  onBack(): void {
    this.globalService.redirectUser('store-list');
  };
}
