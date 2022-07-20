import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditItemIngredientsComponent } from './edit-item-ingredients.component';

describe('EditItemIngredientsComponent', () => {
  let component: EditItemIngredientsComponent;
  let fixture: ComponentFixture<EditItemIngredientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditItemIngredientsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditItemIngredientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
