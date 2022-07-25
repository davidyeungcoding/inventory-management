import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { ItemService } from 'src/app/services/item.service';

@Component({
  selector: 'app-create-item',
  templateUrl: './create-item.component.html',
  styleUrls: ['./create-item.component.css']
})
export class CreateItemComponent implements OnInit, OnDestroy {
  addItem = new FormGroup({
    name: new FormControl(''),
    price: new FormControl(0.00),
    active: new FormControl('false'),
    available: new FormControl('false')
  });

  constructor(
    private itemService: ItemService
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  // ======================
  // || Helper Functions ||
  // ======================

  clearForm(): void {
    this.addItem.setValue({
      name: '',
      price: 0.00,
      active: 'false',
      available: 'false'
    });
  };

  // =======================
  // || General Functions ||
  // =======================

  onCreateItem(): void {
    // console.log(this.addItem.value);
    this.itemService.createItem(this.addItem.value).subscribe(_res => {
      console.log(_res)
      if (_res.status === 200) {
        // display success message
        // add item to list
        // clear form
        // remove modal
      } else {
        // display error message
      }
    })
  };

  onCancelCreate(): void {
    this.clearForm();
    (<any>$('#createItemModal')).modal('hide');
  };
}
