import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditItemDetailsComponent } from './edit-item-details.component';

describe('EditItemDetailsComponent', () => {
  let component: EditItemDetailsComponent;
  let fixture: ComponentFixture<EditItemDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditItemDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditItemDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
