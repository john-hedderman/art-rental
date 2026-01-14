import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { Jobs2List } from './jobs2-list';
import { provideHttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Art, Job } from '../../../model/models';

const mockArtObservable: Observable<Art[]> = of([
  {
    art_id: 1,
    full_size_image_url: 'http://fake.art.com/aaa.jpg',
    title: '',
    file_name: '',
    tags: '',
    job_id: 0,
    artist_id: 6,
  },
]);

const mockJobsObservable: Observable<Job[]> = of([
  {
    job_id: 1,
    job_number: '000005',
    client_id: 2,
    site_id: 3,
    contact_ids: [],
    art_ids: [],
  },
]);

describe('Jobs2List', () => {
  let component: Jobs2List;
  let fixture: ComponentFixture<Jobs2List>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Jobs2List],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(Jobs2List);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load all data when the component is initialized', fakeAsync(() => {
      component.art$ = mockArtObservable;
      component.jobs$ = mockJobsObservable;

      component.ngOnInit();
      tick(1000);
      fixture.detectChanges();

      component.art$?.subscribe((art) => {
        expect(art[0].artist_id).toBe(6);
      });
      component.jobs$?.subscribe((jobs) => {
        expect(jobs[0].job_number).toBe('000005');
      });
    }));
  });
});
