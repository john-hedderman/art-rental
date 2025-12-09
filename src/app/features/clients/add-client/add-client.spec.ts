import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { AddClient } from './add-client';

describe('AddClient', () => {
  let component: AddClient;
  let fixture: ComponentFixture<AddClient>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddClient],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(AddClient);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
