import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { GlobalService } from 'src/app/services/global.service';
import { StoreService } from 'src/app/services/store.service';
import { UserService } from 'src/app/services/user.service';

import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-search-store',
  templateUrl: './search-store.component.html',
  styleUrls: ['./search-store.component.css']
})
export class SearchStoreComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription;
  private activeUser?: User|null;
  searchQuery = new FormGroup({
    term: new FormControl('')
  });

  constructor(
    private globalService: GlobalService,
    private storeService: StoreService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.activeUser.subscribe(_user => this.activeUser = _user));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // =======================
  // || General Functions ||
  // =======================

  onSearch(): void {
    $('#searchStoreBtn').prop('disabled', true);
    $('#storeMsgContainer').css('display', 'none');
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#storeMsg');
    const term = this.searchQuery.value.term;

    this.storeService.searchStore(token, term!).subscribe(_store => {
      if (_store.status === 200) {
        if (_store.token) localStorage.setItem('token', _store.token);
        this.storeService.changeStoreList(_store.msg);
        
        if (!_store.msg.length) {
          this.userService.changeSystemMsg(`No stores found matching term: ${term}`);
          this.globalService.displayMsg('alert-danger', '#storeMsg');
        };
      } else {
        this.userService.changeSystemMsg(_store.msg);
        this.globalService.displayMsg('alert-danger', '#storeMsg');
      };
      
      (<HTMLInputElement>$('#searchStoreField')[0]).value = '';
      this.searchQuery.setValue({ term: '' });
      $('#searchStoreBtn').prop('disabled', false);
    });
  };
}
