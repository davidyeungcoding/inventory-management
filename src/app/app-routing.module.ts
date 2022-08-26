import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { IngredientListComponent } from './components/ingredient/ingredient-list/ingredient-list.component';
import { StoreListComponent } from './components/store/store-list/store-list.component';
import { ItemListComponent } from './components/item/item-list/item-list.component';
import { HomeComponent } from './components/home/home/home.component';

const routes: Routes = [
  { path: 'ingredient-list', component: IngredientListComponent},
  { path: 'store-list', component: StoreListComponent },
  { path: 'item-list', component: ItemListComponent },
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
