import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtDetail } from './art-detail';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

describe('ArtDetail', () => {
  let component: ArtDetail;
  let fixture: ComponentFixture<ArtDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtDetail],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
