import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { JobList } from './job-list';
import { provideHttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { IArt, Job } from '../../../model/models';

const mockArtObservable: Observable<IArt[]> = of([
  {
    art_id: 1,
    full_size_image_url: 'http://fake.art.com/aaa.jpg',
    title: '',
    file_name: '',
    tags: '',
    job_id: 0,
    artist_id: 6
  }
] as unknown as IArt[]);

const mockJobsObservable: Observable<Job[]> = of([
  {
    job_id: 1,
    job_number: '000005',
    client_id: 2,
    site_id: 3,
    contact_ids: [],
    art_ids: []
  }
]);

describe('JobList', () => {
  let component: JobList;
  let fixture: ComponentFixture<JobList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobList],
      providers: [provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(JobList);
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
