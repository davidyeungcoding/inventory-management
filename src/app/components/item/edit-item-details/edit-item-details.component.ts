import { Component, Input, OnInit } from '@angular/core';

import { ItemService } from 'src/app/services/item.service';

import { Item } from 'src/app/interfaces/item';

@Component({
  selector: 'app-edit-item-details',
  templateUrl: './edit-item-details.component.html',
  styleUrls: ['./edit-item-details.component.css']
})
export class EditItemDetailsComponent implements OnInit {
  @Input() targetItem: Item|null = null;

  constructor(
    private itemService: ItemService
  ) { }

  ngOnInit(): void {
  }

}
