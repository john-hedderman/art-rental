import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtThumbnailCard } from './art-thumbnail-card';

describe('ThumbnailCard', () => {
  let component: ArtThumbnailCard;
  let fixture: ComponentFixture<ArtThumbnailCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtThumbnailCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtThumbnailCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
