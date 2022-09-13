import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { UserService } from 'src/app/services/user.service';

import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  activeUser?: User|null;

  constructor(
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.activeUser.subscribe(_user => this.activeUser = _user));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // to do: When navigating different pages =>
    // remove aria-current from the current option
    // remove .active class from current option
    // if navigating with the navbar
      // add aria-current to the selected option
      // add .active class to the selected option
  // to do: figure out how to swap collapse navbar for off canvas

  // =======================
  // || General Functions ||
  // =======================

  onNavigate(next: string): void {}

  onLogout(): void {
    this.userService.logout();
  };
}
