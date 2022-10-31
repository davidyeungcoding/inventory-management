import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { EditItemDetailsComponent } from './components/item/edit-item-details/edit-item-details.component';
import { EditItemIngredientsComponent } from './components/item/edit-item-ingredients/edit-item-ingredients.component';
import { ItemListComponent } from './components/item/item-list/item-list.component';
import { CreateItemComponent } from './components/item/create-item/create-item.component';
import { DeleteItemComponent } from './components/item/delete-item/delete-item.component';
import { IngredientListComponent } from './components/ingredient/ingredient-list/ingredient-list.component';
import { CreateIngredientComponent } from './components/ingredient/create-ingredient/create-ingredient.component';
import { DeleteIngredientComponent } from './components/ingredient/delete-ingredient/delete-ingredient.component';
import { EditIngredientComponent } from './components/ingredient/edit-ingredient/edit-ingredient.component';
import { CreateUserComponent } from './components/home/create-user/create-user.component';
import { UserListComponent } from './components/user/user-list/user-list.component';
import { HomeComponent } from './components/home/home/home.component';
import { LoginComponent } from './components/home/login/login.component';
import { StoreListComponent } from './components/store/store-list/store-list.component';
import { ManageUserComponent } from './components/store/users/manage-user/manage-user.component';
import { AddUserComponent } from './components/store/users/add-user/add-user.component';
import { EditUserAccountTypeComponent } from './components/store/users/edit-user-account-type/edit-user-account-type.component';
import { StoreDetailsComponent } from './components/store/store-details/store-details.component';
import { SearchStoreComponent } from './components/store/search-store/search-store.component';
import { DeleteStoreComponent } from './components/store/delete-store/delete-store.component';
import { RemoveUserComponent } from './components/store/users/remove-user/remove-user.component';
import { CreateStoreComponent } from './components/store/create-store/create-store.component';
import { NavbarComponent } from './components/navbar/navbar/navbar.component';
import { StoreListIntersectionDirective } from './directives/store-list-intersection.directive';
import { UserAccountComponent } from './components/user/user-account/user-account.component';
import { NavIntersectionDirective } from './directives/nav-intersection.directive';
import { ResetPasswordComponent } from './components/user/reset-password/reset-password.component';
import { DeleteUserComponent } from './components/user/delete-user/delete-user.component';
import { EditUserComponent } from './components/user/edit-user/edit-user.component';
import { SearchUserComponent } from './components/user/search-user/search-user.component';
import { AdminCreateUserComponent } from './components/user/admin-create-user/admin-create-user.component';
import { ManageStoresComponent } from './components/user/manage-stores/manage-stores.component';
import { EditOrderComponent } from './components/store/orders/edit-order/edit-order.component';
import { ExistingOrdersComponent } from './components/store/orders/existing-orders/existing-orders.component';
import { EditOrderIntersectionDirective } from './directives/edit-order-intersection.directive';
import { EditOrderIntersectionAltDirective } from './directives/edit-order-intersection-alt.directive';
import { ManageOrdersComponent } from './components/store/orders/manage-orders/manage-orders.component';

@NgModule({
  declarations: [
    AppComponent,
    EditItemDetailsComponent,
    EditItemIngredientsComponent,
    ItemListComponent,
    CreateItemComponent,
    DeleteItemComponent,
    IngredientListComponent,
    CreateIngredientComponent,
    DeleteIngredientComponent,
    EditIngredientComponent,
    CreateUserComponent,
    UserListComponent,
    HomeComponent,
    LoginComponent,
    StoreListComponent,
    ManageUserComponent,
    AddUserComponent,
    EditUserAccountTypeComponent,
    StoreDetailsComponent,
    SearchStoreComponent,
    DeleteStoreComponent,
    RemoveUserComponent,
    CreateStoreComponent,
    NavbarComponent,
    StoreListIntersectionDirective,
    UserAccountComponent,
    NavIntersectionDirective,
    ResetPasswordComponent,
    DeleteUserComponent,
    EditUserComponent,
    SearchUserComponent,
    AdminCreateUserComponent,
    ManageStoresComponent,
    EditOrderComponent,
    ExistingOrdersComponent,
    EditOrderIntersectionDirective,
    EditOrderIntersectionAltDirective,
    ManageOrdersComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
