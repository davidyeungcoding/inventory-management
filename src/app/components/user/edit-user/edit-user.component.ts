import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { GlobalService } from 'src/app/services/global.service';
import { UserService } from 'src/app/services/user.service';

import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit, OnDestroy {
  @Input() editUserForm?: any;
  @Input() targetUser?: User;
  private subscriptions = new Subscription();
  private userList?: User[];
  private timeout?: number;
  editUserMessage?: string;
  usernameError?: string;
  passwordError?: string;

  constructor(
    private globalService: GlobalService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.usernameError.subscribe(_msg => this.usernameError = _msg));
    this.subscriptions.add(this.userService.passwordError.subscribe(_msg => this.passwordError = _msg));
    this.subscriptions.add(this.userService.systemMsg.subscribe(_msg => this.editUserMessage = _msg));
    this.subscriptions.add(this.userService.fullUserList.subscribe(_list => this.userList = _list));
    this.subscriptions.add(this.globalService.timeout.subscribe(_time => this.timeout = _time));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ==================
  // || Form Getters ||
  // ==================

  get username() { return this.editUserForm.get('username') };
  get password() { return this.editUserForm.get('password') };

  // ======================
  // || Helper Functions ||
  // ======================

  checkForChanges(form: any): boolean {
    if (!form.username && !form.password
      && this.targetUser!.accountType === form.accountType) {
      this.userService.changeSystemMsg('No changes detected');
      this.globalService.displayMsg('alert-light', '#editUserMsg');
      $('#editUserBtn').prop('disabled', false);
      return false;
    };

    return true;
  };

  checkInput(entry: any, field: string): boolean {
    const check = this.globalService.testName(entry);
    
    if (!check) {
      this.userService.changeSystemMsg(`Please enter a valid ${field.toLowerCase()}. ${field} may not include special characters.`);
      this.globalService.displayMsg('alert-danger', '#editUserMsg');
    };

    return check;
  };

  validateForm(form: any): boolean {
    if (form.username) {
      $('#editUserBtn').prop('disabled', false);
      if (!this.checkInput(form.username, 'Username')) return false;
    };
    
    if (form.password) {
      $('#editUserBtn').prop('disabled', false);
      if (!this.checkInput(form.password, 'Password')) return false;
    };

    return true;
  };

  buildPayload(form: any): any {
    const payload:any = { _id: this.targetUser!._id };
    if (form.username) payload.username = form.username;
    if (form.password) payload.password = form.password;
    if (form.accountType !== this.targetUser!.accountType) payload.accountType = form.accountType;
    return payload;
  };

  // =======================
  // || General Functions ||
  // =======================

  onTogglePassword(field: string): void {
    this.globalService.togglePassword(field);
  };

  onEditUser(): void {
    $('#editUserBtn').prop('disabled', true);
    $('#editUserMsgContainer').css('display', 'none');
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingTokenModal('#editUserMsg', '#editUserModal');
    const form = this.editUserForm.value;
    if (!this.checkForChanges(form)) return;
    if (!this.validateForm(form)) return;
    const payload = this.buildPayload(form);
    
    this.userService.editUserDetails(token, payload).subscribe(_user => {
      if (_user.status === 200) {
        if (_user.token) localStorage.setItem('token', _user.token);
        const temp = this.globalService.replaceInList(this.userList!, _user.msg);
        this.userService.changeFullUserList(temp);
        this.userService.changeSystemMsg('User has been successfully updated');
        this.globalService.displayMsg('alert-success', '#editUserMsg');
        setTimeout(() => { (<any>$('#editUserModal')).modal('hide') }, this.timeout);
      } else {
        this.userService.changeSystemMsg(_user.msg);
        this.globalService.displayMsg('alert-danger', '#editUserMsg');
        $('#editUserBtn').prop('disabled', false);
      };
    });
  };
}
