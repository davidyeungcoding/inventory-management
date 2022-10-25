import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-existing-orders',
  templateUrl: './existing-orders.component.html',
  styleUrls: ['./existing-orders.component.css']
})
export class ExistingOrdersComponent implements OnInit, OnDestroy {
  @Input() previousOrders: any;
  @Input() orderDate: any;
  private subscriptions = new Subscription();
  existingOrdersMessage?: string;

  constructor(
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.systemMsg.subscribe(_msg => this.existingOrdersMessage = _msg));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
