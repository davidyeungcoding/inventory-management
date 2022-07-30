import { Component, Input, OnInit } from '@angular/core';
// import { FormControl, FormGroup } from '@angular/forms';

import { ItemService } from 'src/app/services/item.service';
import { GlobalService } from 'src/app/services/global.service';

import { Item } from 'src/app/interfaces/item';

@Component({
  selector: 'app-edit-item-details',
  templateUrl: './edit-item-details.component.html',
  styleUrls: ['./edit-item-details.component.css']
})
export class EditItemDetailsComponent implements OnInit {
  @Input() targetItem!: Item|null;
  @Input() editItem!: any;
  editMessage: string = '';

  constructor(
    private itemService: ItemService,
    private globalService: GlobalService
  ) { }

  ngOnInit(): void {
  }

  // ======================
  // || Helper Functions ||
  // ======================

  clearForm():void {
    this.editItem.setValue({
      name: '',
      price: '',
      active: '',
      available: ''
    });
  };

  validateName(name: string): boolean {
    const check = this.itemService.testName(name);

    if (!check) {
      this.editMessage = 'Please enter a valid item name. Name may not include special characters.';
      this.globalService.displayMsg('alert-danger', '#editMsg', '#editMsgContainer');
    };

    return check;
  };

  validatePrice(price: string): boolean {
    const check = this.itemService.testPrice(price);

    if (!check) {
      this.editMessage = 'Please enter a valid price.';
      this.globalService.displayMsg('alert-danger', '#editMsg', '#editMsgContainer');
    };

    return check;
  };

  // =======================
  // || General Functions ||
  // =======================

  onEditItem(): void {
    const form =  this.editItem.value;
    if (form.name.length && !this.validateName(form.name)) return;
    if (form.price.length && !this.validatePrice(form.price)) return;
    $('#editItemBtn').prop('disabled', true);

    const tempItem:any = {
      active: form.active,
      available: form.available
    };

    if (form.name) tempItem.name = form.name;
    if (form.price) tempItem.price = this.itemService.parsePrice(form.price);
    
    const payload = {
      id: this.targetItem?._id,
      update: tempItem
    };

    this.itemService.editItemDetails(payload).subscribe(_item => {
      if (_item.status === 200) {
        this.editMessage = 'Item successfully updated';
        this.globalService.displayMsg('alert-success', '#editMsg', '#editMsgContainer');
        // handle update item list
        
        setTimeout(() => {
          (<any>$('#editItemModal')).modal('hide');
          $('#editItemBtn').prop('disabled', false);
          $('#editMsgContainer').css('display', 'none');
        }, 1500);
      } else {
        this.editMessage = _item.msg;
        this.globalService.displayMsg('alert-danger', '#editMsg', '#editMsgContainer');
        $('#editItemBtn').prop('disabled', false);
      };
    });
  };

  onCancelEdit(): void {
    this.clearForm();
    (<any>$('#editItemModal')).modal('hide');
    $('#editItemBtn').prop('disabled', false);
    $('#editMsgContainer').css('display', 'none');
  };
}
