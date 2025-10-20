import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSite } from './add-site';

describe('AddSite', () => {
  let component: AddSite;
  let fixture: ComponentFixture<AddSite>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSite]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSite);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
