import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectCard } from './select-card';

describe('SelectCard', () => {
  let component: SelectCard;
  let fixture: ComponentFixture<SelectCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
