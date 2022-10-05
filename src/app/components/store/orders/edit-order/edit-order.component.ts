import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { GlobalService } from 'src/app/services/global.service';
import { StoreService } from 'src/app/services/store.service';
import { UserService } from 'src/app/services/user.service';

import { Store } from 'src/app/interfaces/store';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-order',
  templateUrl: './edit-order.component.html',
  styleUrls: ['./edit-order.component.css']
})
export class EditOrderComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  editOrderMessage?: string;
  activeStore?: Store;
  order = new FormGroup ({
    date: new FormGroup({
      month: new FormControl('', [Validators.required, Validators.pattern('\\d{2}')]),
      day: new FormControl('', [Validators.required, Validators.pattern('\\d{2}')]),
      year: new FormControl('', [Validators.required, Validators.pattern('\\d{4}')])
    }),
    orderDetails: new FormGroup({
      lineItems: new FormArray([]),
      orderIngredients: new FormArray([]),
      totalCost: new FormControl(''),
      storeId: new FormControl('')
    })
  });

  constructor(
    private globalService: GlobalService,
    private storeService: StoreService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.systemMsg.subscribe(_msg => this.editOrderMessage = _msg));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ==================
  // || Form Getters ||
  // ==================

  get month() { return this.order.controls.date.get('month') };
  get day() { return this.order.controls.date.get('day') };
  get year() { return this.order.controls.date.get('year') };

  // ======================
  // || Helper Functions ||
  // ======================

  validateOrderDate(): boolean {
    return !!this.month && !this.month.errors && !!Number(this.month.value)
    && !!this.day && !this.day.errors && !!Number(this.day.value)
    && !!this.year && !this.year.errors && !!Number(this.year.value);
  };

  // =======================
  // || General Functions ||
  // =======================

  onSubmitOrder(): void {
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#editOrderMsg');
    if (!this.validateOrderDate()) return;
    const year = Number(this.year?.value);
    const month = Number(this.month?.value) - 1;
    const day = Number(this.day?.value);
    const formDate = new Date(year, month, day);
    console.log(formDate)
  };
}
