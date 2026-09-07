import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArtistNgrxDetail } from './artist-ngrx-detail';

describe('ArtistNgrxDetail', () => {
  let component: ArtistNgrxDetail;
  let fixture: ComponentFixture<ArtistNgrxDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtistNgrxDetail]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ArtistNgrxDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
