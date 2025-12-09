import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { AddContact } from './add-contact';

describe('AddContact', () => {
  let component: AddContact;
  let fixture: ComponentFixture<AddContact>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddContact],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(AddContact);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
