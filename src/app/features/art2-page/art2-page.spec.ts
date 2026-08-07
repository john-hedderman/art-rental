import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Art2Page } from './art2-page';

describe('Art2Page', () => {
  let component: Art2Page;
  let fixture: ComponentFixture<Art2Page>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Art2Page]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Art2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
