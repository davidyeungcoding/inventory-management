import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { GlobalService } from 'src/app/services/global.service';
import { UserService } from 'src/app/services/user.service';

import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-admin-create-user',
  templateUrl: './admin-create-user.component.html',
  styleUrls: ['./admin-create-user.component.css']
})
export class AdminCreateUserComponent implements OnInit, OnDestroy {
  @Input() createUserForm: any;
  private subscriptions = new Subscription();
  private userList?: User[];
  private timeout?: number;
  adminCreateUserMessage?: string;
  usernameError?: string;
  passwordError?: string;

  constructor(
    private globalService: GlobalService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.systemMsg.subscribe(_msg => this.adminCreateUserMessage = _msg));
    this.subscriptions.add(this.userService.fullUserList.subscribe(_list => this.userList = _list));
    this.subscriptions.add(this.globalService.timeout.subscribe(_time => this.timeout = _time));
    this.subscriptions.add(this.userService.usernameError.subscribe(_msg => this.usernameError = _msg));
    this.subscriptions.add(this.userService.passwordError.subscribe(_msg => this.passwordError = _msg));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ==================
  // || Form Getters ||
  // ==================

  get username() { return this.createUserForm.get('username') };
  get password() { return this.createUserForm.get('password') };

  // ======================
  // || Helper Functions ||
  // ======================

  checkInput(entry: any, field: string): boolean {
    const check = entry ? this.globalService.testName(entry) : false;

    if (!entry) {
      this.userService.changeSystemMsg(`Please enter a valid ${field.toLowerCase()}. ${field} may not include special characters.`);
      this.globalService.displayMsg('alert-danger', '#adminCreateUserMsg');
    };

    return check;
  };

  verifyForm(form: any): boolean {
    if (!this.checkInput(form.username, 'Username')) {
      $('#adminCreateUserBtn').prop('disabled', false);
      return false;
    };
    
    if (!this.checkInput(form.password, 'Password')) {
      $('#adminCreateUserBtn').prop('disabled', false);
      return false;
    };

    return true;
  };

  addUser(user: User): void {
    const temp = [...this.userList!];
    temp.push(user);
    this.userService.changeFullUserList(temp);
  };

  // =======================
  // || General Functions ||
  // =======================

  onTogglePassword(elemId: string): void {
    this.globalService.togglePassword(elemId);
  };

  onCreateUser(): void {
    $('#adminCreateUserBtn').prop('disabled', true);
    $('#adminCreateUserMsgContainer').css('display', 'none');
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingTokenModal('#adminCreateUserMsg', '#adminCreateUserModal');
    const form = this.createUserForm.value;
    if (!this.verifyForm(form)) return;

    this.userService.adminCreateUser(token, form).subscribe(_user => {
      if (_user.status === 201) {
        this.addUser(_user.msg);
        this.userService.changeSystemMsg('User added successfully');
        this.globalService.displayMsg('alert-success', '#adminCreateUserMsg');
        setTimeout(() => { (<any>$('#adminCreateUserModal')).modal('hide') }, this.timeout);
      } else {
        this.userService.changeSystemMsg(_user.msg);
        this.globalService.displayMsg('alert-danger', '#adminCreateUserMsg');
        $('#adminCreateUserMsg').prop('disabled', false);
      };
    });
  };
}
