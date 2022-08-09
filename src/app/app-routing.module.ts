import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ItemListComponent } from './components/item/item-list/item-list.component';
import { IngredientListComponent } from './components/ingredient/ingredient-list/ingredient-list.component';

const routes: Routes = [
  { path: 'item-list', component: ItemListComponent },
  { path: 'ingredient-list', component: IngredientListComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
