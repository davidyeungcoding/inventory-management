import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { GlobalService } from 'src/app/services/global.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  login = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });

  constructor(
    private globalServvice: GlobalService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
  }

  // ==================
  // || Form Getters ||
  // ==================

  get username() { return this.login.get('username') };
  get password() { return this.login.get('password') };

  // ======================
  // || Helper Functions ||
  // ======================

  clearForm(): void {
    this.login.setValue({
      username: '',
      password: ''
    });
  };

  validateEntry(term: any): boolean {
    const check = this.globalServvice.testName(term);

    if (!check) {
      this.userService.changeHomeMessage('Invalid username or password');
      this.globalServvice.displayMsg('alert-danger', '#homeMsg');
    };

    return check;
  };

  // =======================
  // || General Functions ||
  // =======================

  onLogin(): void {
    $('#homeMsgContainer').css('display', 'none');
    const form = this.login.value;
    if (!this.validateEntry(form.username)) return;
    if (!this.validateEntry(form.password)) return;
    $('#loginUserBtn').prop('disabled', true);

    this.userService.loginUser(form).subscribe(_user => {
      if (_user.status === 200) {
        this.clearForm();
        this.userService.changeActiveUser(_user.msg);
        localStorage.setItem('token', _user.token);
        this.globalServvice.redirectUser('store-list');
      } else {
        this.userService.changeHomeMessage(_user.msg);
        this.globalServvice.displayMsg('alert-danger', '#homeMsg');
      };

      $('#loginUserBtn').prop('disabled', false);
    })
  };

  onTogglePassword(field: string): void {
    this.globalServvice.togglePassword(field);
  };
}
