import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { GlobalService } from 'src/app/services/global.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit, OnDestroy {
  @Input() addUser: any;
  private subscriptions = new Subscription();
  usernameError?: string;
  passwordError?: string;

  constructor(
    private globalService: GlobalService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.usernameError.subscribe(_msg => this.usernameError = _msg));
    this.subscriptions.add(this.userService.passwordError.subscribe(_msg => this.passwordError = _msg));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ==================
  // || Form Getters ||
  // ==================

  get username() { return this.addUser.get('username') };
  get password() { return this.addUser.get('password') };

  // ======================
  // || Helper Functions ||
  // ======================

  clearForm(): void {
    this.addUser.setValue({
      username: '',
      password: ''
    });

    this.addUser.markAsPristine();
    this.addUser.markAsUntouched();
  };

  validateEntry(username: any, type: string): boolean {
    const check = this.globalService.testName(username);

    if (!check) {
      this.userService.changeHomeMessage(`Please enter a valid ${type}`);
      this.globalService.displayMsg('alert-danger', '#homeMsg');
    };

    return check;
  };

  // =======================
  // || General Functions ||
  // =======================

  onCreateUser(): void {
    $('#homeMsgContainer').css('display', 'none');
    const form = this.addUser.value;
    if (!this.validateEntry(form.username, 'username')) return;
    if (!this.validateEntry(form.password, 'password')) return;
    $('#createUserBtn').prop('disabled', true);

    this.userService.createUser(form).subscribe(_user => {
      if (_user.status === 201) {
        this.userService.changeHomeMessage('User successfully created');
        this.globalService.displayMsg('alert-success', '#homeMsg');
        this.clearForm();
      } else {
        this.userService.changeHomeMessage(_user.msg);
        this.globalService.displayMsg('alert-danger', '#homeMsg');
      };
      
      $('#createUserBtn').prop('disabled', false);
    });
  };

  onTogglePassword(field: string): void {
    this.globalService.togglePassword(field);
  };
}
