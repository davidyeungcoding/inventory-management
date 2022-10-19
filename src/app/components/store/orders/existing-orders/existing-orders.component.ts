import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-existing-orders',
  templateUrl: './existing-orders.component.html',
  styleUrls: ['./existing-orders.component.css']
})
export class ExistingOrdersComponent implements OnInit {
  @Input() previousOrders: any;

  constructor() { }

  ngOnInit(): void {
  }

}
