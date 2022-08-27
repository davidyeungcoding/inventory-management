import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { IngredientListComponent } from './components/ingredient/ingredient-list/ingredient-list.component';
import { StoreListComponent } from './components/store/store-list/store-list.component';
import { ItemListComponent } from './components/item/item-list/item-list.component';
import { HomeComponent } from './components/home/home/home.component';

const routes: Routes = [
  { path: 'ingredient-list/:storeId', component: IngredientListComponent},
  { path: 'store-list', component: StoreListComponent },
  { path: 'item-list/:storeId', component: ItemListComponent },
  { path: 'home', component: HomeComponent },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
