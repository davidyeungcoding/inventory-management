import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExistingOrdersComponent } from './existing-orders.component';

describe('ExistingOrdersComponent', () => {
  let component: ExistingOrdersComponent;
  let fixture: ComponentFixture<ExistingOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExistingOrdersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExistingOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
