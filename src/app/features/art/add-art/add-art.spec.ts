import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { AddArt } from './add-art';

describe('AddArt', () => {
  let component: AddArt;
  let fixture: ComponentFixture<AddArt>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddArt],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(AddArt);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
