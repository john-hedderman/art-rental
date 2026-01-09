import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Jobs2List } from './jobs2-list';

describe('Jobs2List', () => {
  let component: Jobs2List;
  let fixture: ComponentFixture<Jobs2List>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Jobs2List]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Jobs2List);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
