import { Component, Input, OnInit } from '@angular/core';

import { Item } from 'src/app/interfaces/item';
import { Ingredient } from 'src/app/interfaces/ingredient';

@Component({
  selector: 'app-edit-item-ingredients',
  templateUrl: './edit-item-ingredients.component.html',
  styleUrls: ['./edit-item-ingredients.component.css']
})
export class EditItemIngredientsComponent implements OnInit {
  @Input() targetItem!: Item|null;
  @Input() ingredientList!: any[];
  @Input() fullIngredientList!: any[];
  private toChange: any = {};

  constructor() { }

  ngOnInit(): void {
  }

  // ======================
  // || Helper Functions ||
  // ======================

  changeSelected(ingredient: Ingredient, action: string): void {
    const target = this.toChange[ingredient._id];
    target ? delete this.toChange[ingredient._id]
    : this.toChange[ingredient._id] = action;
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
  };

  onCancel(): void {
    console.log('onCancel()')
    this.toChange = {};
  };
}
