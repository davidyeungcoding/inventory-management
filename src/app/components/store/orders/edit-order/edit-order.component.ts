import { Component, OnInit } from '@angular/core';

import { GlobalService } from 'src/app/services/global.service';
import { StoreService } from 'src/app/services/store.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-edit-order',
  templateUrl: './edit-order.component.html',
  styleUrls: ['./edit-order.component.css']
})
export class EditOrderComponent implements OnInit {
  editOrderMessage?: string;

  constructor(
    private globalService: GlobalService,
    private storeService: StoreService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
  }

}
