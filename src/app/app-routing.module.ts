import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './components/home/home/home.component';
import { StoreListComponent } from './components/store/store-list/store-list.component';
import { ItemListComponent } from './components/item/item-list/item-list.component';
import { IngredientListComponent } from './components/ingredient/ingredient-list/ingredient-list.component';
import { ManageUserComponent } from './components/store/users/manage-user/manage-user.component';
import { UserListComponent } from './components/user/user-list/user-list.component';
import { StoreDetailsComponent } from './components/store/store-details/store-details.component';
import { UserAccountComponent } from './components/user/user-account/user-account.component';
import { EditOrderComponent } from './components/store/orders/edit-order/edit-order.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'store-list', component: StoreListComponent },
  { path: 'item-list/:storeId', component: ItemListComponent },
  { path: 'ingredient-list/:storeId', component: IngredientListComponent},
  { path: 'store-details/:storeId', component: StoreDetailsComponent},
  { path: 'manage-user/:storeId', component: ManageUserComponent },
  { path: 'user-list', component: UserListComponent },
  { path: 'user-account', component: UserAccountComponent },
  { path: 'edit-order/:storeId', component: EditOrderComponent },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
