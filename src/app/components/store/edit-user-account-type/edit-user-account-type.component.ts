import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { GlobalService } from 'src/app/services/global.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-edit-user-account-type',
  templateUrl: './edit-user-account-type.component.html',
  styleUrls: ['./edit-user-account-type.component.css']
})
export class EditUserAccountTypeComponent implements OnInit, OnDestroy {
  @Input() editUserAccountTypeMessage?: string;
  @Input() accountTypeForm: any;
  private subscriptions = new Subscription();
  accountType: any;

  constructor(
    private globalService: GlobalService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.accountType.subscribe(_types => this.accountType = _types));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ======================
  // || Helper Functions ||
  // ======================

  handleMissingToken(): void {
    this.editUserAccountTypeMessage = this.globalService.missingTokenMsg;
    this.globalService.displayMsg('alert-danger', '#editUserAccountTypeMsg');
    
    setTimeout(() => {
      (<any>$('#editUserAccountTypeModal')).modal('hide');
      this.userService.logout();
    }, this.globalService.timeoutLong);
  };

  // ========================
  // || Generaal Functions ||
  // ========================

  onEditAccountType(): void {
    $('#editUserAccountTypeMsgContainer').css('display', 'none');
    $('#editUserAccountTypeBtn').prop('disabled', true);
    const token = localStorage.getItem('token');
    if (!token) return this.handleMissingToken();
    // to do: disable ability to change account of higher level
  };
}
