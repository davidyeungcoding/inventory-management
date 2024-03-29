import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { GlobalService } from 'src/app/services/global.service';
import { StoreService } from 'src/app/services/store.service';
import { UserService } from 'src/app/services/user.service';

import { Store } from 'src/app/interfaces/store';

@Component({
  selector: 'app-create-store',
  templateUrl: './create-store.component.html',
  styleUrls: ['./create-store.component.css']
})
export class CreateStoreComponent implements OnInit, OnDestroy {
  @Input() createStore: any;
  private subscriptions = new Subscription();
  private storeList?: Store[];
  private timeout?: number;
  states?: string[];
  createStoreMessage?: string;
  selectedState?: string;

  constructor(
    private globalService: GlobalService,
    private storeService: StoreService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.storeService.selectedState.subscribe(_state => this.selectedState = _state));
    this.subscriptions.add(this.userService.systemMsg.subscribe(_msg => this.createStoreMessage = _msg));
    this.subscriptions.add(this.storeService.storeList.subscribe(_list => this.storeList = _list));
    this.subscriptions.add(this.globalService.timeout.subscribe(_time => this.timeout = _time));
    this.subscriptions.add(this.globalService.states.subscribe(_list => this.states = _list));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ==================
  // || Form Getters ||
  // ==================

  get name() { return this.createStore.get('name') };
  get street() { return this.createStore.get('street') };
  get city() { return this.createStore.get('city') };
  get state() { return this.createStore.get('state') };
  get zip() { return this.createStore.get('zip') };

  // ======================
  // || Helper Functions ||
  // ======================

  validateForm(): boolean {
    if (this.name.invalid || this.street.invalid || this.city.invalid || this.state.invalid || this.zip.invalid) {
      this.name.markAsTouched();
      this.street.markAsTouched();
      this.city.markAsTouched();
      this.state.markAsTouched();
      this.zip.markAsTouched();
      $('#createStoreBtn').prop('disabled', false);
      return false;
    };

    return true;
  };

  updateStoreList(store: Store): void {
    const temp = [...this.storeList!];
    temp.push(store);
    this.storeService.changeStoreList(temp);
  };

  // =======================
  // || General Functions ||
  // =======================

  onCreateStore(): void {
    $('#createStoreBtn').prop('disabled', true);
    $('#createStoreMsgContainer').css('display', 'hidden');
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingTokenModal('#createStoreMsg', '#createStoreModal');
    const form = this.createStore.value;
    if (!this.validateForm()) return;

    this.storeService.createStore(token, form).subscribe(_store => {
      if (_store.status === 200 || _store.status === 201) {
        if (_store.token) localStorage.setItem('token', _store.token);
        this.userService.changeSystemMsg('Store successfully created');
        this.globalService.displayMsg('alert-success', '#createStoreMsg');
        this.updateStoreList(_store.msg);
        setTimeout(() => { (<any>$('#createStoreModal')).modal('hide') }, this.timeout);
      } else {
        this.userService.changeSystemMsg(_store.msg);
        this.globalService.displayMsg('alert-danger', '#createStoreMsg');
        $('#createStoreBtn').prop('disabled', false);
      };
    });
  };

  onChangeSelectedState(state: string): void {
    this.storeService.changeSelectedState(state);
    this.createStore.patchValue({ state: state });
  };
}
