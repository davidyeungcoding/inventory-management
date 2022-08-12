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
import { EditIngredientDetailsComponent } from './components/ingredient/edit-ingredient-details/edit-ingredient-details.component';
import { CreateIngredientComponent } from './components/ingredient/create-ingredient/create-ingredient.component';
import { DeleteIngredientComponent } from './components/ingredient/delete-ingredient/delete-ingredient.component';
import { EditIngredientComponent } from './components/ingredient/edit-ingredient/edit-ingredient.component';

@NgModule({
  declarations: [
    AppComponent,
    EditItemDetailsComponent,
    EditItemIngredientsComponent,
    ItemListComponent,
    CreateItemComponent,
    DeleteItemComponent,
    IngredientListComponent,
    EditIngredientDetailsComponent,
    CreateIngredientComponent,
    DeleteIngredientComponent,
    EditIngredientComponent
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
