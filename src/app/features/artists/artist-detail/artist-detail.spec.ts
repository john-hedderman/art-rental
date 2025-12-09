import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { ArtistDetail } from './artist-detail';

describe('ArtistDetail', () => {
  let component: ArtistDetail;
  let fixture: ComponentFixture<ArtistDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtistDetail],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtistDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
