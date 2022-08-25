import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { GlobalService } from 'src/app/services/global.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit, OnDestroy {
  addUser = new FormGroup({
    username: new FormControl(''),
    password: new FormControl('')
  });

  constructor(
    private globalService: GlobalService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  // ======================
  // || Helper Functions ||
  // ======================

  clearForm(): void {
    this.addUser.setValue({
      username: '',
      password: ''
    });
  };

  validateUsername(username: any): boolean {
    const check = this.globalService.testName(username);

    if (!check) {
      this.userService.changeHomeMessage('Please enter a valid username. Username may not include special characters.');
      this.globalService.displayMsg('alert-danger', '#homeMsg', '#homeMsgContainer');
    };

    return check;
  };

  validatePassword(password: any): boolean {
    const check = this.globalService.testName(password);
    
    if (!check) {
      this.userService.changeHomeMessage('Please enter a valid password. Password may not include special characters.');
      this.globalService.displayMsg('alert-danger', '#homeMsg', '#homeMsgContainer');
    };

    return check;
  };

  // =======================
  // || General Functions ||
  // =======================

  onCreateUser(): void {
    $('#homeMsgContainer').css('display', 'none');
    const form = this.addUser.value;
    if (!this.validateUsername(form.username!)) return;
    if (!this.validatePassword(form.password!)) return;
    $('#createUserBtn').prop('disabled', true);

    this.userService.createUser(form).subscribe(_user => {
      if (_user.status === 201) {
        this.userService.changeHomeMessage('User successfully created');
        this.globalService.displayMsg('alert-success', '#homeMsg', '#homeMsgContainer');
        this.clearForm();
      } else {
        this.userService.changeHomeMessage(_user.msg);
        this.globalService.displayMsg('alert-danger', '#homeMsg', '#homeMsgContainer');
      };
      
      $('#createUserBtn').prop('disabled', false);
    });
  };
}
