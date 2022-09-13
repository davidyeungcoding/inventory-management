import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { GlobalService } from 'src/app/services/global.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  addMessage: string = '';

  constructor(
    private globalService: GlobalService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.homeMessage.subscribe(_msg => this.addMessage = _msg));
    this.globalService.resetPasswordVisability('#password');
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // =======================
  // || General Functions ||
  // =======================

  onShowContent(element: string, field: string): void {
    const show = element === 'login' ? '#loginContainer' : '#registerContainer';
    const hide = element === 'login' ? '#registerContainer' : '#loginContainer';
    const showTab = element === 'login' ? '#loginTab' : '#registerTab';
    $('#homeMsgContainer').css('display', 'none');
    $(show).css('display', 'inline');
    $(hide).css('display', 'none');
    $('.tab-header').removeClass('active-tab');
    $(showTab).addClass('active-tab');
    this.globalService.resetPasswordVisability(field);
  };
}
