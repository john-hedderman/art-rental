import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtPage } from './art-page';

describe('ArtPage', () => {
  let component: ArtPage;
  let fixture: ComponentFixture<ArtPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArtPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
