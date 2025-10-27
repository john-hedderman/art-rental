import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { AddClient } from './add-client';

describe('AddClient', () => {
  let component: AddClient;
  let fixture: ComponentFixture<AddClient>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddClient],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(AddClient);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
