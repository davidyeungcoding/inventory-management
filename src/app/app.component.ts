import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { UserService } from './services/user.service';

import { User } from './interfaces/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  private userData: User|null = null;
  title = 'inventory-management';

  constructor(
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(this.userService.activeUser.subscribe(_user => this.userData = _user));
    this.confirmUserData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  confirmUserData(): void {
    if (!this.userData) {
      const token = localStorage.getItem('token');
      if (!token) return this.userService.logout();

      this.userService.retrieveUserData(token).subscribe(_user => {
        if (_user.status === 200) {
          if (_user.token) localStorage.setItem('token', _user.token);
          this.userService.changeActiveUser(_user.msg);
          this.userService.changeAccountType(_user.msg.accountType);
        } else {
          this.userService.logout();
        };
      });
    };
  };
}
