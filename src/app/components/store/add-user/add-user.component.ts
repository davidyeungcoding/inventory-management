import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { UserService } from 'src/app/services/user.service';
import { GlobalService } from 'src/app/services/global.service';

import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit, OnDestroy {
  @Input() errorMessage!: string;
  @Input() storeUsers!: User[];
  @Input() filteredUserList!: User[];

  constructor(
    private globalService: GlobalService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  // =======================
  // || General Functions ||
  // =======================

  toRemove(user: User): void {}

  toAdd(user: User): void {}

  onUpdateStoreUsers(): void {}

  onCancel(): void {
    (<any>$('#addUserModal')).modal('hide');
  };
}
