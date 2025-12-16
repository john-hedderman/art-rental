import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { ArtList } from './art-list';
import { DataService } from '../../../service/data-service';
import { provideRouter, Router } from '@angular/router';
import { ArtDetail } from '../art-detail/art-detail';
import { AddArt } from '../add-art/add-art';

describe('ArtList', () => {
  let component: ArtList;
  let fixture: ComponentFixture<ArtList>;
  let router: Router;

  const mockDataService = {
    art$: of([
      { art_id: 1, job_id: 11, artist_id: 4, title: 'Wonder Art' },
      { art_id: 2, job_id: 12 },
      { art_id: 3 },
    ]),
    artists$: of([{ artist_id: 4, name: 'Fred Rogers' }, { artist_id: 5 }, { artist_id: 6 }]),
    clients$: of([{ client_id: 7 }, { client_id: 8, name: 'Amazon' }, { client_id: 9 }]),
    jobs$: of([
      { job_id: 10 },
      { job_id: 11, client_id: 8, site_id: 15 },
      { job_id: 12, client_id: 9, site_id: 13 },
    ]),
    sites$: of([{ site_id: 13 }, { site_id: 14 }, { site_id: 15, name: 'Area 51' }]),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtList],
      providers: [
        provideHttpClient(),
        { provide: DataService, useValue: mockDataService },
        provideRouter([
          { path: 'art/:id', component: ArtDetail },
          { path: 'art/add', component: AddArt },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtList);
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

      expect(component.artwork[0].job?.job_id).toBe(11);
      expect(component.artwork[0].job?.client?.name).toBe('Amazon');
      expect(component.artwork[0].job?.site?.name).toBe('Area 51');
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

    it('should display the client and job names in the card footer', () => {
      const footerEl = fixture.nativeElement.querySelector(
        'app-card:first-of-type .ar-card-footer div'
      );
      expect(footerEl.innerHTML).toBe('<strong>Job: </strong>Amazon (Area 51)');
    });

    it('should display the name of the artwork and artist in the card', () => {
      const artNameEl = fixture.nativeElement.querySelector(
        'app-card:first-of-type .card-body .card-title'
      );
      expect(artNameEl.innerHTML).toBe('Wonder Art');

      const artistNameEl = fixture.nativeElement.querySelector(
        'app-card:first-of-type .card-body .card-text'
      );
      expect(artistNameEl.innerHTML).toBe('Fred Rogers');
    });
  });

  describe('Navigation', () => {
    it('should navigate to artist detail when a card is clicked', async () => {
      const routerSpy = spyOn(router, 'navigate');
      const cardEl = fixture.nativeElement.querySelector(
        '.ar-card:first-of-type'
      ) as HTMLDivElement;
      cardEl.click();
      expect(routerSpy).toHaveBeenCalledOnceWith(['/art', 1]);
    });

    it('should navigate to add artist when the Add Artist footer button is clicked', async () => {
      const routerSpy = spyOn(router, 'navigate');
      const addButtonEl = fixture.nativeElement.querySelector('#addBtn') as HTMLButtonElement;
      addButtonEl.click();
      expect(routerSpy).toHaveBeenCalledOnceWith(['/art', 'add']);
    });
  });
});
