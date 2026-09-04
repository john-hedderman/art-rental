import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddArtistNgrx } from './add-artist-ngrx';

describe('AddArtistNgrx', () => {
  let component: AddArtistNgrx;
  let fixture: ComponentFixture<AddArtistNgrx>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddArtistNgrx]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AddArtistNgrx);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
