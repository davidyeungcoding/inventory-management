import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { ItemService } from 'src/app/services/item.service';

import { Item } from 'src/app/interfaces/item';
import { Ingredient } from 'src/app/interfaces/ingredient';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-item-ingredients',
  templateUrl: './edit-item-ingredients.component.html',
  styleUrls: ['./edit-item-ingredients.component.css']
})
export class EditItemIngredientsComponent implements OnInit, OnDestroy {
  @Input() targetItem!: Item|null;
  @Input() ingredientList!: any[];
  @Input() fullIngredientList!: any[];
  private subscriptions = new Subscription();
  private toChange: any = {};

  constructor(
    private itemService: ItemService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.itemService.toChange.subscribe(_targets => this.toChange = _targets));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ======================
  // || Helper Functions ||
  // ======================

  changeSelected(ingredient: Ingredient, action: string): void {
    const temp = {...this.toChange};
    const target = temp[ingredient._id];
    target ? delete temp[ingredient._id] : temp[ingredient._id] = action;
    this.itemService.changeToChange(temp);
  };

  highlight(ingredient: Ingredient): void {
    this.toChange[ingredient._id] ? $(`#${ingredient._id}`).removeClass('selected')
    : $(`#${ingredient._id}`).addClass('selected');
  };

  // =======================
  // || General Functions ||
  // =======================

  toAdd(ingredient: Ingredient): void {
    this.highlight(ingredient);
    this.changeSelected(ingredient, 'add');
  };

  toRemove(ingredient: Ingredient): void {
    this.highlight(ingredient);
    this.changeSelected(ingredient, 'remove');
  };

  onUpdate(): void {
    console.log('onUpdate()')
    console.log(this.toChange)
  };

  onCancel(): void {
    console.log('onCancel()')
    this.itemService.changeToChange({});
    this.itemService.clearHighlight();
  };
}
