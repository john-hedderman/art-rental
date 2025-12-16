import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { ArtistList } from './artist-list';
import { DataService } from '../../../service/data-service';
import { provideRouter, Router } from '@angular/router';
import { ArtistDetail } from '../artist-detail/artist-detail';
import { AddArtist } from '../add-artist/add-artist';

const mockDataService = {
  artists$: of([
    { artist_id: 4, name: 'Vincent Van Gogh', tags: 'starry' },
    { artist_id: 5 },
    { artist_id: 6, name: 'Claude Monet' },
  ]),
};

describe('ArtistList', () => {
  let component: ArtistList;
  let fixture: ComponentFixture<ArtistList>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtistList],
      providers: [
        provideHttpClient(),
        { provide: DataService, useValue: mockDataService },
        provideRouter([
          { path: 'artists/:id', component: ArtistDetail },
          { path: 'artists/add', component: AddArtist },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtistList);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load all data when the component is initialized', fakeAsync(() => {
      component.ngOnInit();
      tick(1000);
      fixture.detectChanges();

      expect(component.artists[2].artist_id).toBe(6);
      expect(component.artists[2].name).toBe('Claude Monet');
    }));
  });

  describe('Populate template', () => {
    beforeEach(fakeAsync(() => {
      component.ngOnInit();
      tick(1000);
      fixture.detectChanges();
    }));

    it('should display three cards', () => {
      const cardEls = fixture.nativeElement.querySelectorAll('app-card');
      expect(cardEls.length).toBe(3);
    });

    it('should display the artist name and tags in the card', () => {
      const artNameEl = fixture.nativeElement.querySelector(
        'app-card:first-of-type .card-body .card-title'
      );
      expect(artNameEl.innerHTML).toBe('Vincent Van Gogh');

      const artistNameEl = fixture.nativeElement.querySelector(
        'app-card:first-of-type .card-body .card-text'
      );
      expect(artistNameEl.innerHTML).toBe('starry');
    });
  });

  describe('Navigation', () => {
    it('should navigate to artist detail when a card is clicked', async () => {
      const routerSpy = spyOn(router, 'navigate');
      const cardEl = fixture.nativeElement.querySelector(
        '.ar-card:first-of-type'
      ) as HTMLDivElement;
      cardEl.click();
      expect(routerSpy).toHaveBeenCalledOnceWith(['/artists', 4]);
    });

    it('should navigate to add artist when the Add Artist footer button is clicked', async () => {
      const routerSpy = spyOn(router, 'navigate');
      const addButtonEl = fixture.nativeElement.querySelector('#addBtn') as HTMLButtonElement;
      addButtonEl.click();
      expect(routerSpy).toHaveBeenCalledOnceWith(['/artists', 'add']);
    });
  });
});
