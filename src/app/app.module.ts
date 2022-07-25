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

@NgModule({
  declarations: [
    AppComponent,
    EditItemDetailsComponent,
    EditItemIngredientsComponent,
    ItemListComponent,
    CreateItemComponent
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
