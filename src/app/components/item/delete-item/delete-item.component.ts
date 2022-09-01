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
  itemList: Item[] = [];
  deleteMessage: String = '';

  constructor(
    private globalService: GlobalService,
    private userService: UserService,
    private itemService: ItemService
  ) { }

  ngOnInit(): void {
    this.itemService.itemList.subscribe(_list => this.itemList = _list);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ======================
  // || Helper Functions ||
  // ======================

  removeItemFromList(): void {
    let temp = [...this.itemList];
    
    for (let i = 0; i < temp.length; i++) {
      if (temp[i]._id === this.targetItem!._id) {
        temp.splice(i, 1);
        break;
      };
    };
    
    this.itemService.changeItemList(temp);
  };

  handleMissingToken(): void {
    this.deleteMessage = this.globalService.missingTokenMsg;
    this.globalService.displayMsg('alert-danger', '#deleteItemMsg');
    
    setTimeout(() => {
      (<any>$('#deleteItemModal')).modal('hide');
      this.userService.logout();
    }, this.globalService.timeoutLong);

    return;
  };

  // =======================
  // || General Functions ||
  // =======================

  onDelete(): void {
    $('#deleteItemMsgContainer').css('display', 'none');
    $('#deleteItemBtn').prop('disabled', true);
    const token = localStorage.getItem('token');
    if (!token) return this.handleMissingToken();

    this.itemService.deleteItem(this.targetItem!, token!).subscribe(_res => {
      this.deleteMessage = _res.msg;

      if (_res.status === 200) {
        this.removeItemFromList();
        this.globalService.displayMsg('alert-success', '#deleteItemMsg');
        setTimeout(() => { (<any>$('#deleteItemModal')).modal('hide') }, this.globalService.timeout);
      } else {
        this.globalService.displayMsg('alert-danger', '#deleteItemMsg');
        $('#deleteItemBtn').prop('disabled', false);
      };
    });
  };
}
