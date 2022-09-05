import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { GlobalService } from 'src/app/services/global.service';
import { StoreService } from 'src/app/services/store.service';
import { UserService } from 'src/app/services/user.service';

import { Store } from 'src/app/interfaces/store';

@Component({
  selector: 'app-store-details',
  templateUrl: './store-details.component.html',
  styleUrls: ['./store-details.component.css']
})
export class StoreDetailsComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  states = this.globalService.states;
  storeDetailsMessage?: string;
  storeDetails?: Store;
  selectedState?: string;
  editStoreDetails = new FormGroup({
    name: new FormControl(''),
    street: new FormControl(''),
    city: new FormControl(''),
    state: new FormControl(''),
    zip: new FormControl('')
  });

  constructor(
    private globalService: GlobalService,
    private storeService: StoreService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.getStoreDetails();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ======================
  // || Helper Functions ||
  // ======================

  handleMissingToken(): void {
    this.storeDetailsMessage = this.globalService.missingTokenMsg;
    this.globalService.displayMsg('alert-danger', '#storeDetailsMsg');
    setTimeout(() => { this.userService.logout() }, this.globalService.timeoutLong);
  };

  setPlaceHolders(store: Store): void {
    $('#editStoreName').attr('placeholder', store.name);
    $('#editStoreStreet').attr('placeholder', store.street);
    $('#editStoreCity').attr('placeholder', store.city);
    this.selectedState = store.state;
    $('#editStoreZip').attr('placeholder', store.zip);
  };

  // =======================
  // || General Functions ||
  // =======================

  getStoreDetails(): void {
    const token = localStorage.getItem('token');
    if (!token) return this.handleMissingToken();
    const storeId = document.URL.substring(document.URL.lastIndexOf('/') + 1);

    this.storeService.getStoreDetails(token, storeId).subscribe(_store => {
      if (_store.status === 200) {
        if (_store.token) localStorage.setItem('token', _store.token);
        this.storeDetails = _store.msg;
        this.setPlaceHolders(_store.msg);
      } else {
        this.storeDetailsMessage = _store.msg;
        this.globalService.displayMsg('alert-danger', '#storeDetailsMsg');
      };
    });
  };

  onChangeSelectedState(state: string): void {
    this.selectedState = state;
    this.editStoreDetails.patchValue({ state: state });
  };

  onEditStoreDetails(): void {
    console.log(this.editStoreDetails.value)
  }

  onBack(): void {
    this.globalService.redirectUser('store-list');
  };
}
