import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { GlobalService } from 'src/app/services/global.service';
import { UserService } from 'src/app/services/user.service';

import { Store } from 'src/app/interfaces/store';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-manage-stores',
  templateUrl: './manage-stores.component.html',
  styleUrls: ['./manage-stores.component.css']
})
export class ManageStoresComponent implements OnInit, OnDestroy {
  @Input() filteredStoreList?: Store[];
  @Input() userStores?: Store[];
  @Input() toChange: any = {};
  @Input() activeUser?: User;
  private subscriptions = new Subscription();
  private userList?: User[];
  private timeout?: number;
  manageStoresMessage?: string;

  constructor(
    private globalService: GlobalService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.systemMsg.subscribe(_msg => this.manageStoresMessage = _msg));
    this.subscriptions.add(this.userService.fullUserList.subscribe(_list => this.userList = _list));
    this.subscriptions.add(this.globalService.timeout.subscribe(_time => this.timeout = _time));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ======================
  // || Helper Functions ||
  // ======================

  changeSelected(id: string, action: string): void {
    this.toChange[id] ? delete this.toChange[id] : this.toChange[id] = action;
  };

  handleNoChanges(): void {
    this.userService.changeSystemMsg('No changes detected');
    this.globalService.displayMsg('alert-light', '#manageStoresMsg');
    $('#manageStoresBtn').prop('disabled', false);
  };

  // =======================
  // || General Functions ||
  // =======================

  toAdd(store: Store): void {
    this.globalService.highlight(store._id, this.toChange);
    this.changeSelected(store._id, 'add');
  };

  toRemove(store: Store): void {
    this.globalService.highlight(store._id, this.toChange);
    this.changeSelected(store._id, 'remove');
  };

  updateStores(): void {
    $('#manageStoresBtn').prop('disabled', true);
    $('#manageStoresMsgContainer').css('display', 'none');
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingTokenModal('#manageStoresMsg', '#manageStoresModal');
    if (!Object.keys(this.toChange).length) return this.handleNoChanges();
    
    const payload = {
      _id: this.activeUser!._id,
      toChange: this.toChange
    };

    this.userService.editUserStores(token, payload).subscribe(_user => {
      if (_user.status === 200) {
        if (_user.token) localStorage.setItem('token', _user.token);
        this.userService.changeSystemMsg('User\'s store list updated');
        this.globalService.displayMsg('alert-success', '#manageStoresMsg');
        const temp = this.globalService.replaceInList([...this.userList!], _user.msg);
        this.userService.changeFullUserList(temp);
        setTimeout(() => { (<any>$('#manageStoresModal')).modal('hide') }, this.timeout);
      } else {
        this.userService.changeSystemMsg(_user.msg);
        this.globalService.displayMsg('alert-danger', '#manageStoresMsg');
        $('#manageStoresBtn').prop('disabled', false);
      };
    });
  };
}
