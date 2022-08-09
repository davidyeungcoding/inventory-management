import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditIngredientDetailsComponent } from './edit-ingredient-details.component';

describe('EditIngredientDetailsComponent', () => {
  let component: EditIngredientDetailsComponent;
  let fixture: ComponentFixture<EditIngredientDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditIngredientDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditIngredientDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
