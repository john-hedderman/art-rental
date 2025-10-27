import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { AddArtist } from './add-artist';

describe('AddArtist', () => {
  let component: AddArtist;
  let fixture: ComponentFixture<AddArtist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddArtist],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(AddArtist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
