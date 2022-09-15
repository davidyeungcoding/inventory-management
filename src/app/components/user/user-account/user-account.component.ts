import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { GlobalService } from 'src/app/services/global.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-account',
  templateUrl: './user-account.component.html',
  styleUrls: ['./user-account.component.css']
})
export class UserAccountComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  activeUser?: User|null;

  constructor(
    private globalService: GlobalService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.activeUser.subscribe(_user => this.activeUser = _user));
    this.globalService.makeActiveNav('#navUserAccount');
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
