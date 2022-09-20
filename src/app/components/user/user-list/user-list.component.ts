import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { GlobalService } from 'src/app/services/global.service';
import { UserService } from 'src/app/services/user.service';

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
  userList?: User[];

  constructor(
    private globalService: GlobalService,
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

  onResetPassword(user: User): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#userListMsg');
    $('#resetPasswordMsgContainer').css('display', 'none');
    $('#resetPasswordBtn').prop('disabled', false);
    this.targetUser = user;
    (<any>$('#resetPasswordModal')).modal('show');
  };

  onDeleteUser(user: User): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#userListMsg');
    $('#deleteUserMsgContainer').css('display', 'none');
    $('#deleteUserBtn').prop('disabled', false);
    this.targetUser = user;
    (<any>$('#deleteUserModal')).modal('show');
  };
}
