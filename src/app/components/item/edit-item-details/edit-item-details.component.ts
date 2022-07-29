import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { ItemService } from 'src/app/services/item.service';

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
    private itemService: ItemService
  ) { }

  ngOnInit(): void {
  }

  onEditItem(): void {
    console.log(this.targetItem)
  };

  onCancelEdit(): void {
    console.log(this.editItem.value)
  };
}
