import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditUserAccountTypeComponent } from './edit-user-account-type.component';

describe('EditUserAccountTypeComponent', () => {
  let component: EditUserAccountTypeComponent;
  let fixture: ComponentFixture<EditUserAccountTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditUserAccountTypeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditUserAccountTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
