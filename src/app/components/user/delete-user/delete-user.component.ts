import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { GlobalService } from 'src/app/services/global.service';
import { UserService } from 'src/app/services/user.service';

import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-delete-user',
  templateUrl: './delete-user.component.html',
  styleUrls: ['./delete-user.component.css']
})
export class DeleteUserComponent implements OnInit, OnDestroy {
  @Input() targetUser?: User;
  private subscriptions = new Subscription();
  private userList?: User[];
  private timeout?: number;
  deleteUserMessage?: string;

  constructor(
    private globalService: GlobalService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.systemMsg.subscribe(_msg => this.deleteUserMessage = _msg));
    this.subscriptions.add(this.userService.fullUserList.subscribe(_list => this.userList = _list));
    this.subscriptions.add(this.globalService.timeout.subscribe(_time => this.timeout = _time));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  
  // ======================
  // || Helper Functions ||
  // ======================

  purgeUser(): void {
    const temp = [...this.userList!];

    for (let i = 0; i < temp.length; i++) {
      if (temp[i]._id === this.targetUser!._id) {
        temp.splice(i, 1);
        break;
      };
    };

    this.userService.changeFullUserList(temp);
  };

  // =======================
  // || General Functions ||
  // =======================

  onDeleteUser(): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingTokenModal('#deleteUserMsg', '#deleteUserModal');
    $('#deleteUserBtn').prop('disabled', true);
    const payload = { targetId: this.targetUser!._id };

    this.userService.deleteUser(token, payload).subscribe(_res => {
      if (_res.status === 200) {
        if (_res.token) localStorage.setItem('token', _res.token);
        this.userService.changeSystemMsg(_res.msg);
        this.globalService.displayMsg('alert-success', '#deleteUserMsg');
        this.purgeUser();
        setTimeout(() => { (<any>$('#deleteUserModal')).modal('hide') }, this.timeout);
      } else {
        this.userService.changeSystemMsg(_res.msg);
        this.globalService.displayMsg('alert-danger', '#deleteUserMsg');
        $('#deleteUserBtn').prop('disabled', false);
      };
    });
  };
}
