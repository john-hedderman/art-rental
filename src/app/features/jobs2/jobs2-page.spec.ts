import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Jobs2Page } from './jobs2-page';

describe('Jobs2Page', () => {
  let component: Jobs2Page;
  let fixture: ComponentFixture<Jobs2Page>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Jobs2Page]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Jobs2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
