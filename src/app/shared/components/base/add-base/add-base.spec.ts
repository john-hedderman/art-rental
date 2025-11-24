import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBase } from './add-base';

describe('AddBase', () => {
  let component: AddBase;
  let fixture: ComponentFixture<AddBase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBase]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBase);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
