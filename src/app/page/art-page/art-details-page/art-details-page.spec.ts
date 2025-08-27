import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtDetailsPage } from './art-details-page';

describe('ArtDetailsPage', () => {
  let component: ArtDetailsPage;
  let fixture: ComponentFixture<ArtDetailsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtDetailsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArtDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
