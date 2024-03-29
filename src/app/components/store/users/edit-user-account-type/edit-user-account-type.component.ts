import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { GlobalService } from 'src/app/services/global.service';
import { UserService } from 'src/app/services/user.service';

import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-edit-user-account-type',
  templateUrl: './edit-user-account-type.component.html',
  styleUrls: ['./edit-user-account-type.component.css']
})
export class EditUserAccountTypeComponent implements OnInit, OnDestroy {
  @Input() accountTypeForm: any;
  @Input() activeUser?: User;
  private subscriptions = new Subscription();
  private storeUsers?: User[];
  private timeout?: number;
  editUserAccountTypeMessage?: string;
  accountType: any;

  constructor(
    private globalService: GlobalService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.systemMsg.subscribe(_msg => this.editUserAccountTypeMessage = _msg));
    this.subscriptions.add(this.userService.accountType.subscribe(_types => this.accountType = _types));
    this.subscriptions.add(this.userService.storeUsers.subscribe(_list => this.storeUsers = _list));
    this.subscriptions.add(this.globalService.timeout.subscribe(_time => this.timeout = _time));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ======================
  // || Helper Functions ||
  // ======================

  replaceUser(user: User): void {
    const temp = this.globalService.replaceInList(this.storeUsers!, user);
    this.globalService.sortList(temp, 'username');
    this.userService.changeStoreUsers(temp);
  };

  checkForChanges(form: any): boolean {
    if (form.accountType === this.activeUser?.accountType) {
      this.userService.changeSystemMsg('No changes detected');
      this.globalService.displayMsg('alert-light', '#editUserAccountTypeMsg');
      $('#editUserAccountTypeBtn').prop('disabled', false);
      return false;
    };

    return true;
  };

  // ========================
  // || Generaal Functions ||
  // ========================

  onEditAccountType(): void {
    $('#editUserAccountTypeMsgContainer').css('display', 'none');
    $('#editUserAccountTypeBtn').prop('disabled', true);
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingTokenModal('#editUserAccountTypeMsg', '#editUserAccountTypeModal');
    const form = this.accountTypeForm.value;
    if (!this.checkForChanges(form)) return;

    this.userService.updateAccountType(token, form).subscribe(_user => {
      this.userService.changeSystemMsg(_user.msg);

      if (_user.status === 200) {
        if (_user.token) localStorage.setItem('token', _user.token);
        this.globalService.displayMsg('alert-success', '#editUserAccountTypeMsg');
        this.replaceUser(form);

        setTimeout(() => {
          $('#editUserAccountTypeBtn').prop('disabled', false);
          (<any>$('#editUserAccountTypeModal')).modal('hide');
        }, this.timeout);
      } else {
        this.globalService.displayMsg('alert-danger', '#editUserAccountTypeMsg');
        $('#editUserAccountTypeBtn').prop('disabled', false);
      };
    });
  };
}
