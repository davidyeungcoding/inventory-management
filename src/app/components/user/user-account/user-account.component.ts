import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { GlobalService } from 'src/app/services/global.service';
import { UserService } from 'src/app/services/user.service';

import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-user-account',
  templateUrl: './user-account.component.html',
  styleUrls: ['./user-account.component.css']
})
export class UserAccountComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  userAccountMessage?: string;
  activeUser?: User|null;
  userForm = new FormGroup({
    _id: new FormControl(''),
    username: new FormControl(''),
    password: new FormControl('')
  });

  constructor(
    private globalService: GlobalService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.systemMsg.subscribe(_msg => this.userAccountMessage = _msg));
    this.subscriptions.add(this.userService.activeUser.subscribe(_user => this.activeUser = _user));
    this.globalService.makeActiveNav('#navUserAccount');
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ======================
  // || Helper Functions ||
  // ======================

  displayMessage(message: string, status: string): void {
    this.userService.changeSystemMsg(message);
    this.globalService.displayMsg(`alert-${status}`, '#userAccountMsg');
    $('#userAccountBtn').prop('disabled', false);
  };

  testEntry(entry: string, type: string): boolean {
    const check = this.globalService.testName(entry);

    if (!check) {
      const message = `Please enter a valid ${type.toLowerCase()}. ${type} may not include special characters.`;
      this.displayMessage(message, 'danger');
    };

    return check;
  };

  validateForm(form: any): boolean {
    if (!form.username && !form.password) {
      this.displayMessage('No changes detected', 'danger');
      return false;
    };
    
    if (form.username) {
      const validUsername = this.testEntry(form.username, 'Username');
      if (!validUsername) return validUsername;
    };

    if (form.password) {
      const validPassword = this.testEntry(form.password, 'Password');
      if (!validPassword) return validPassword;
    };
    
    return true;
  };

  // =======================
  // || General Functions ||
  // =======================

  onEditUserAccount(): void {
    $('#userAccountBtn').prop('disabled', true);
    $('#userAccountMsgContainer').css('display', 'none');
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#userAccountMsg');
    const form = this.userForm.value;
    if (!this.validateForm(form)) return;
    const payload: any = { toChange: { _id: this.activeUser!._id } };
    if (form.username) payload.toChange.username = form.username;
    if (form.password) payload.toChange.password = form.password;

    this.userService.editUserDetails(payload, token).subscribe(_user => {
      if (_user.status === 200) {
        if (_user.token) localStorage.setItem('token', _user.token);
        this.userService.changeActiveUser(_user.msg);
        this.userService.changeSystemMsg('User successfully updated');
        this.globalService.displayMsg('alert-success', '#userAccountMsg');
      } else {
        this.userService.changeSystemMsg(_user.msg);
        this.globalService.displayMsg('alert-danger', '#userAccountMsg');
      };

      $('#userAccountBtn').prop('disabled', false);
    })
  };
}
