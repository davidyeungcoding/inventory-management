import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ItemService } from 'src/app/services/item.service';
import { IngredientService } from 'src/app/services/ingredient.service';

import { Item } from 'src/app/interfaces/item';
import { Ingredient } from 'src/app/interfaces/ingredient';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css']
})
export class ItemListComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  itemList: Item[] = [];
  targetItem: Item|null = null;
  targetIngredients: Ingredient[] = [];
  fullIngredientList: any[] = [];
  deleteMessage: String = '';
  editForm = new FormGroup({
    name: new FormControl(''),
    price: new FormControl(''),
    active: new FormControl(''),
    available: new FormControl('')
  });

  constructor(
    private itemService: ItemService,
    private ingredientService: IngredientService
  ) { }

  ngOnInit(): void {
    this.retrieveItemList();
    this.subscriptions.add(this.itemService.itemList.subscribe(_list => this.itemList = _list));
    this.subscriptions.add(this.ingredientService.ingredientList.subscribe(_list => this.fullIngredientList = _list));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ======================
  // || Helper Functions ||
  // ======================

  convertPrice(list: Item[]): void {
    list.forEach(item => {
      const price = item.price;
      item.price = `$${price.substring(0, price.length - 2)}.${price.substring(price.length - 2)}`;
    });
  };

  onTargetItem(item: Item, target: string): void {
    $(`${target}`).css('display', 'none');
    this.targetItem = item;
  };

  onEditItemIngredients(item: Item, target: string): void {
    this.onTargetItem(item, target);
    this.targetIngredients = item.ingredients;
    this.retrieveIngredientList();
  };

  filterIngredientList(item: Ingredient[], list: Ingredient[], index: number): any {
    if (!item.length) return list;
    const id = item[index]._id;
    let temp = [...list];

    for (let i = 0; i < temp.length; i++) {
      if (id === temp[i]._id) {
        temp.splice(i, 1);
        if (index + 1 !== item.length) temp = this.filterIngredientList(item, temp, ++index);
        break;
      };
    };

    return temp;
  };

  // =======================
  // || General Functions ||
  // =======================

  retrieveItemList(): void {
    this.itemService.getFullItemList().subscribe(_list => {
      this.convertPrice(_list.msg);
      this.itemService.changeItemList(_list.msg);
    });
  };

  retrieveIngredientList(): void {
    this.ingredientService.getIngredientList().subscribe(_list => {
      const list = this.filterIngredientList(this.targetItem!.ingredients, _list.msg, 0);
      this.ingredientService.chagneIngredientList(list);
    });
  };

  onEditSetup(item: Item, target: string): void {
    this.onTargetItem(item, target);
    $('#editName').attr('placeholder', this.targetItem!.name);
    $('#editPrice').attr('placeholder', this.targetItem!.price);
    this.editForm.setValue({
      name: '',
      price: '',
      active: item.active.toString(),
      available: item.available.toString()
    });
  };

  onBack(): void {
    console.log('back');
    // handle go back
  };
}
