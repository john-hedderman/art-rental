import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArtistsNgrxList } from './artists-ngrx-list';

describe('ArtistsNgrxList', () => {
  let component: ArtistsNgrxList;
  let fixture: ComponentFixture<ArtistsNgrxList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtistsNgrxList]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ArtistsNgrxList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
