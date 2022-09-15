import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { UserService } from 'src/app/services/user.service';

import { User } from 'src/app/interfaces/user';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  private navLinks?: string[];
  activeUser?: User|null;
  accountType: any;

  constructor(
    private globalService: GlobalService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.accountType.subscribe(_types => this.accountType = _types));
    this.subscriptions.add(this.userService.activeUser.subscribe(_user => this.activeUser = _user));
    this.subscriptions.add(this.globalService.navLinks.subscribe(_list => this.navLinks = _list));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // =======================
  // || General Functions ||
  // =======================

  onNavRedirect(link: string): void {
    const current = document.URL.substring(document.URL.lastIndexOf('/') + 1);
    if (link === current) return;
    
    if (this.navLinks!.includes(current)) {
      const navId = this.globalService.generateElementId(current);
      this.globalService.removeActiveNav(navId);
    };

    this.globalService.redirectUser(link);
    (<any>$('#navbarOffcanvas')).offcanvas('hide');
  };

  onLogout(): void {
    this.userService.logout();
  };
}
