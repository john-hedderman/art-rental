import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailBase } from './detail-base';

describe('DetailBase', () => {
  let component: DetailBase;
  let fixture: ComponentFixture<DetailBase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailBase]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailBase);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
