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
  states?: string[];
  storeDetailsMessage?: string;
  storeDetails?: Store;
  selectedState?: string;
  editStoreDetails = new FormGroup({
    storeId: new FormControl(''),
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
    this.subscriptions.add(this.userService.systemMsg.subscribe(_msg => this.storeDetailsMessage = _msg));
    this.subscriptions.add(this.globalService.states.subscribe(_list => this.states = _list));
    this.getStoreDetails();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ======================
  // || Helper Functions ||
  // ======================

  setPlaceHolders(store: Store): void {
    this.editStoreDetails.patchValue({ storeId: store._id });
    $('#editStoreName').attr('placeholder', store.name);
    $('#editStoreStreet').attr('placeholder', store.street);
    $('#editStoreCity').attr('placeholder', store.city);
    this.selectedState = store.state;
    this.editStoreDetails.patchValue({ state: store.state });
    $('#editStoreZip').attr('placeholder', store.zip);
  };

  checkForChanges(form: any): boolean {
    if (!form.name && !form.street && !form.city && !form.zip &&
    this.storeDetails!.state === form.state) {
      this.userService.changeSystemMsg('No changes detected');
      this.globalService.displayMsg('alert-light', '#storeDetailsMsg');
      $('#storeDetailsBtn').prop('disabled', false);
      return false;
    };

    return true;
  };

  // =======================
  // || General Functions ||
  // =======================

  getStoreDetails(): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#storeDetailsMsg');
    const storeId = document.URL.substring(document.URL.lastIndexOf('/') + 1);

    this.storeService.getStoreDetails(token, storeId).subscribe(_store => {
      if (_store.status === 200) {
        if (_store.token) localStorage.setItem('token', _store.token);
        this.storeDetails = _store.msg;
        this.setPlaceHolders(_store.msg);
      } else {
        this.userService.changeSystemMsg(_store.msg);
        this.globalService.displayMsg('alert-danger', '#storeDetailsMsg');
      };
    });
  };

  onChangeSelectedState(state: string): void {
    this.selectedState = state;
    this.editStoreDetails.patchValue({ state: state });
  };

  onEditStoreDetails(): void {
    $('#storeDetailsMsgContainer').css('display', 'none');
    $('#storeDetailsBtn').prop('disabled', true);
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#storeDetailsMsg');
    const form = this.editStoreDetails.value;
    if (!this.checkForChanges(form)) return;

    this.storeService.updateStoreDetails(token, form).subscribe(_store => {
      if (_store.status === 200) {
        if (_store.token) localStorage.setItem('token', _store.token);
        this.userService.changeSystemMsg('Store successfully updated');
        this.globalService.displayMsg('alert-success', '#storeDetailsMsg');
      } else {
        this.userService.changeSystemMsg(_store.msg);
        this.globalService.displayMsg('alert-danger', '#storeDetailsMsg');
      };

      $('#storeDetailsBtn').prop('disabled', false);
    });
  };

  onBack(): void {
    this.globalService.redirectUser('store-list');
  };
}
