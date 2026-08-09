import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtStorePage } from './art-store-page';

describe('ArtStorePage', () => {
  let component: ArtStorePage;
  let fixture: ComponentFixture<ArtStorePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtStorePage]
    }).compileComponents();

    fixture = TestBed.createComponent(ArtStorePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
