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
  private navLinks = ['store-list'];
  activeUser?: User|null;

  constructor(
    private globalService: GlobalService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.activeUser.subscribe(_user => this.activeUser = _user));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  // ======================
  // || Helper Functions ||
  // ======================

  generateElementId(str: string): string {
    const splitStr = str.split('-');
    const temp = splitStr.map(elem => elem.charAt(0).toUpperCase() + elem.substring(1));
    return `#nav${temp.join('')}`;
  };

  // =======================
  // || General Functions ||
  // =======================

  onNavRedirect(link: string): void {
    const current = document.URL.substring(document.URL.lastIndexOf('/') + 1);
    if (link === current) return;
    
    if (this.navLinks.includes(current)) {
      const navId = this.generateElementId(current);
      this.globalService.removeActiveNav(navId);
    };

    this.globalService.redirectUser(link);
    (<any>$('#navbarOffcanvas')).offcanvas('hide');
  };

  onLogout(): void {
    this.userService.logout();
  };
}
