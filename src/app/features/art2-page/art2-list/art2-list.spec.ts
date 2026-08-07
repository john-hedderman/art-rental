import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Art2List } from './art2-list';

describe('Art2List', () => {
  let component: Art2List;
  let fixture: ComponentFixture<Art2List>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Art2List]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Art2List);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
