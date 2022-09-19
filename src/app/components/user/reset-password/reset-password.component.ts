import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { GlobalService } from 'src/app/services/global.service';
import { UserService } from 'src/app/services/user.service';

import { User } from 'src/app/interfaces/user';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  @Input() targetUser?: User;
  private subscriptions = new Subscription();
  resetPasswordMessage?: string;

  constructor(
    private globalService: GlobalService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.systemMsg.subscribe(_msg => this.resetPasswordMessage = _msg));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // =======================
  // || General Functions ||
  // =======================

  onConfirmReset(): void {
    $('#resetPasswordBtn').prop('disabled', true);
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingTokenModal('#resetPasswordMsg', '#resetPasswordModal');
    const payload = { _id: this.targetUser!._id };
    
    this.userService.resetPassword(token, payload).subscribe(_user => {
      if (_user.status === 200) {
        if (_user.token) localStorage.setItem('token', _user.token);
        this.userService.changeSystemMsg(`Passowrd updated for ${this.targetUser!.username}. New password: ${_user.msg}`);
        this.globalService.displayMsg('alert-success', '#resetPasswordMsg');
      } else {
        this.userService.changeSystemMsg(_user.msg);
        this.globalService.displayMsg('alert-danger', '#resetPasswordMsg');
        $('#resetPasswordBtn').prop('disabled', false);
      };
    });
  };
}
