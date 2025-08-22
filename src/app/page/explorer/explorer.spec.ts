import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Explorer } from './explorer';

describe('Explorer', () => {
  let component: Explorer;
  let fixture: ComponentFixture<Explorer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Explorer],
    }).compileComponents();

    fixture = TestBed.createComponent(Explorer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
