import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddArt } from './add-art';

describe('AddArt', () => {
  let component: AddArt;
  let fixture: ComponentFixture<AddArt>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddArt]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddArt);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
