import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtistList } from './artist-list';
import { provideHttpClient } from '@angular/common/http';

describe('ArtistList', () => {
  let component: ArtistList;
  let fixture: ComponentFixture<ArtistList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtistList],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtistList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
