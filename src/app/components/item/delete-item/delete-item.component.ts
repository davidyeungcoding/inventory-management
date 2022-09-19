import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { GlobalService } from 'src/app/services/global.service';
import { UserService } from 'src/app/services/user.service';
import { ItemService } from 'src/app/services/item.service';

import { Item } from 'src/app/interfaces/item';

@Component({
  selector: 'app-delete-item',
  templateUrl: './delete-item.component.html',
  styleUrls: ['./delete-item.component.css']
})
export class DeleteItemComponent implements OnInit, OnDestroy {
  @Input() targetItem!: Item|null;
  private subscriptions = new Subscription();
  private timeout?: number;
  itemList: Item[] = [];
  deleteMessage: String = '';

  constructor(
    private globalService: GlobalService,
    private userService: UserService,
    private itemService: ItemService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.userService.systemMsg.subscribe(_msg => this.deleteMessage = _msg));
    this.subscriptions.add(this.itemService.itemList.subscribe(_list => this.itemList = _list));
    this.subscriptions.add(this.globalService.timeout.subscribe(_time => this.timeout = _time));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ======================
  // || Helper Functions ||
  // ======================

  removeItemFromList(): void {
    const temp = this.globalService.purgeFromList(this.itemList, this.targetItem);
    this.itemService.changeItemList(temp);
  };

  // =======================
  // || General Functions ||
  // =======================

  onDelete(): void {
    $('#deleteItemMsgContainer').css('display', 'none');
    $('#deleteItemBtn').prop('disabled', true);
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingTokenModal('#deleteItemMsg', '#deleteItemModal');

    this.itemService.deleteItem(this.targetItem!, token!).subscribe(_res => {
      this.userService.changeSystemMsg(_res.msg);

      if (_res.status === 200) {
        if (_res.token) localStorage.setItem('token', _res.token);
        this.removeItemFromList();
        this.globalService.displayMsg('alert-success', '#deleteItemMsg');
        setTimeout(() => { (<any>$('#deleteItemModal')).modal('hide') }, this.timeout);
      } else {
        this.globalService.displayMsg('alert-danger', '#deleteItemMsg');
        $('#deleteItemBtn').prop('disabled', false);
      };
    });
  };
}
