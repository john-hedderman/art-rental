import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArtistsNgrxPage } from './artists-ngrx-page';

describe('ArtistsNgrxPage', () => {
  let component: ArtistsNgrxPage;
  let fixture: ComponentFixture<ArtistsNgrxPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtistsNgrxPage]
    }).compileComponents();

    fixture = TestBed.createComponent(ArtistsNgrxPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
