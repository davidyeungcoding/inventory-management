import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { GlobalService } from 'src/app/services/global.service';
import { StoreService } from 'src/app/services/store.service';
import { UserService } from 'src/app/services/user.service';

import { Store } from 'src/app/interfaces/store';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  private accountTypeSort: boolean = true;
  private usernameSort: boolean = true;
  targetUser?: User;
  userListMessage?: string;
  storesToChange: any = {};
  userStores? : Store[];
  storeList?: Store[];
  userList?: User[];
  editUserForm = new FormGroup({
    username: new FormControl('', Validators.pattern('^[\\w\\s]+$')),
    password: new FormControl('', Validators.pattern('^[\\w\\s]+$')),
    accountType: new FormControl('')
  });
  createUserForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.pattern('^[\\w\\s]+$')]),
    password: new FormControl('', [Validators.required, Validators.pattern('^[\\w\\s]+$')]),
    accountType: new FormControl('general')
  });

  constructor(
    private globalService: GlobalService,
    private storeService: StoreService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.systemMsg.subscribe(_msg => this.userListMessage = _msg));
    this.subscriptions.add(this.userService.fullUserList.subscribe(_list => this.userList = _list));
    this.globalService.makeActiveNav('#navUserList');
    this.getFullUserList();
  }

  ngOnDestroy(): void {
    this.userService.changeFullUserList([]);
    this.subscriptions.unsubscribe();
  }
  
  // ======================
  // || Helper Functions ||
  // ======================

  buildElemId(term: string): string {
    return `userList${term[0].toUpperCase()}${term.substring(1)}`;
  };

  setupEditUserForm(user: User): void {
    this.editUserForm.setValue({
      username: '',
      password: '',
      accountType: user.accountType
    });

    $('#editUserUsername').attr('placeholder', user.username);
    this.editUserForm.markAsPristine();
    this.editUserForm.markAsUntouched();
  };
  
  resetCreateUserForm(): void {
    this.createUserForm.setValue({
      username: '',
      password: '',
      accountType: 'general'
    });
    
    this.createUserForm.markAsPristine();
    this.createUserForm.markAsUntouched();
  };

  retrieveStoreList(user: User): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#userListMsg');

    this.storeService.getStoreList(token).subscribe(_list => {
      if (_list.status === 200) {
        if (_list.token) localStorage.setItem('token', _list.token);
        this.storeList = this.globalService.filterList(user.stores, _list.msg, 0);
      } else {
        this.userService.changeSystemMsg(_list.msg);
        this.globalService.displayMsg('alert-danger', '#userListMsg');
      };
    });
  };

  setupFilteredStoreList(user: User): void {
    this.retrieveStoreList(user);
  };

  // =======================
  // || General Functions ||
  // =======================

  getFullUserList(): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#userListMsg');

    this.userService.getFullUserList(token).subscribe(_list => {
      if (_list.status === 200) {
        if (_list.token) localStorage.setItem('token', _list.token);
        this.globalService.sortList(_list.msg, 'username');
        $('.skeleton-entry').css('display', 'none');
        this.userService.changeFullUserList(_list.msg);
      } else {
        this.userService.changeFullUserList([]);
        this.userService.changeSystemMsg(_list.msg);
        this.globalService.displayMsg('alert-danger', '#userListMsg');
      };
    });
  };

  sortList(term: string): void{
    if (!this.userList) return;
    const elemId = this.buildElemId(term);
    const direction = term === 'username' ? this.usernameSort : this.accountTypeSort;
    const current = direction ? elemId : `${elemId}Reverse`;
    const next = direction ? `${elemId}Reverse` : elemId;
    const temp = direction ? this.globalService.reverseSortList([...this.userList], term)
    : this.globalService.sortList([...this.userList], term);
    term === 'username' ? this.usernameSort = !this.usernameSort
    : this.accountTypeSort = !this.accountTypeSort;
    $(`#${current}`).addClass('hide');
    $(`#${next}`).removeClass('hide');
    this.userService.changeFullUserList(temp);
  };

  onShowModal(user: User, target: string): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#userListMsg');
    $(`#${target}MsgContainer`).css('display', 'none');
    $(`#${target}Btn`).prop('disabled', false);
    this.targetUser = user;
    (<any>$(`#${target}Modal`)).modal('show');
  };

  onEditUser(user: User, target: string): void {
    this.setupEditUserForm(user);
    this.onShowModal(user, target);
  };

  onManageStores(user: User, target: string): void {
    this.setupFilteredStoreList(user);
    this.userStores = user.stores;
    this.storesToChange = {};
    this.globalService.clearHighlight();
    this.onShowModal(user, target);
  };

  onCreateUser(): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#userListMsg');
    this.resetCreateUserForm();
    $('#adminCreateUserBtn').prop('disabled', false);
    $('#adminCreateUserMsgContainer').css('display', 'none');
    (<any>$('#adminCreateUserModal')).modal('show');
  };
}
