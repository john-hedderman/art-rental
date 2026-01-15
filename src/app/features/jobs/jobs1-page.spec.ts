import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Jobs1Page } from './jobs1-page';

describe('Jobs', () => {
  let component: Jobs1Page;
  let fixture: ComponentFixture<Jobs1Page>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Jobs1Page],
    }).compileComponents();

    fixture = TestBed.createComponent(Jobs1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
