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
  private activeUser?: User|null;
  private usernameSort: boolean = true;
  private accountTypeSort: boolean = true;
  accountType: any;
  targetUser?: User;
  removeUserMsg: string = '';
  manageUserMessage?: string;
  storeUsers: User[] = [];
  filteredUserList: User[] = [];
  userToChange: any = {};
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
    this.subscriptions.add(this.userService.systemMsg.subscribe(_msg => this.manageUserMessage = _msg));
    this.subscriptions.add(this.userService.accountType.subscribe(_types => this.accountType = _types));
    this.subscriptions.add(this.userService.storeUsers.subscribe(_list => this.storeUsers = _list));
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
        this.globalService.sortList(_list.msg, 'username');
        $('.skeleton-entry').css('display', 'none');
        this.userService.changeStoreUsers(_list.msg);
      } else {
        this.userService.changeStoreUsers([]);
        this.userService.changeSystemMsg('No users found for this location');
        this.globalService.displayMsg('alert-danger', '#manageUserMsg');
      };
    });
  };

  sortList(term: string): void {
    if (!this.storeUsers.length) return;
    const elemId = `manageUser${term[0].toUpperCase()}${term.substring(1)}`;
    const direction = term === 'username' ? this.usernameSort : this.accountTypeSort;
    const current = direction ? elemId : `${elemId}Reverse`;
    const next = direction ? `${elemId}Reverse` : elemId;
    const temp = direction ? this.globalService.reverseSortList([...this.storeUsers], term)
    : this.globalService.sortList([...this.storeUsers], term);
    term === 'username' ? this.usernameSort = !this.usernameSort
    : this.accountTypeSort = !this.accountTypeSort;
    $(`#${current}`).addClass('hide');
    $(`#${next}`).removeClass('hide');
    this.userService.changeStoreUsers(temp);
  };

  getManageUserList(): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#manageUserMsg');
    $('#updateStoreUsersBtn').prop('disabled', false);
    $('#addUserMsgContainer').css('display', 'none');
    $('#manageUserMsgContainer').css('display', 'none');
    this.globalService.clearHighlight();
    this.userToChange = {};

    this.userService.getManageUserList(token).subscribe(_list => {
      if (_list.status === 200) {
        if (_list.token) localStorage.setItem('token', _list.token);
        const temp = this.globalService.filterList(this.storeUsers, _list.msg, 0);
        this.filteredUserList = this.globalService.sortList(temp, 'username');
        (<any>$('#manageUserModal')).modal('show');
      } else {
        (<any>$('#manageUserModal')).modal('show');
        this.userService.changeSystemMsg(_list.msg);
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
    this.targetUser = user;
    
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
    $('#confirmRemovalMsgContainer').css('display', 'none');
    $('#confirmRemovalBtn').prop('disabled', false);
    this.targetUser = user;
    this.removeUserMsg = user._id === this.activeUser!._id ? 'Are you sure you want to remove yourself from this location?'
    : `Confirm removal of "${user.username}" from store?`;
    (<any>$('#confirmRemovalModal')).modal('show');
  };

  onBack(): void {
    this.globalService.redirectUser('store-list');
  };
}
