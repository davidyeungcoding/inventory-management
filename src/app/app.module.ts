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
import { CreateUserComponent } from './components/user/create-user/create-user.component';
import { EditUserComponent } from './components/user/edit-user/edit-user.component';
import { UserListComponent } from './components/user/user-list/user-list.component';
import { HomeComponent } from './components/home/home/home.component';
import { LoginComponent } from './components/home/login/login.component';

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
    EditUserComponent,
    UserListComponent,
    HomeComponent,
    LoginComponent
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
