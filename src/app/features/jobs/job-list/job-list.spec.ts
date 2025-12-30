import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';

import { JobList } from './job-list';
import { Client, Job, Site } from '../../../model/models';
import { DataService } from '../../../service/data-service';

const mockJob = {
  job_id: 40,
  job_number: '007',
  client_id: 3,
  site_id: 100,
  contact_ids: [4, 6],
  art_ids: [11, 12],
};

const mockSites = of([
  { site_id: 100, name: 'Auditorium', client_id: 3, job_id: 40 },
  { site_id: 101, client_id: 3, job_id: 0 },
  { site_id: 102, job_id: 0 },
] as Site[]);

const mockDataService = {
  clients$: of([
    { client_id: 1 },
    {
      client_id: 3,
      name: 'Comedy Club',
      city: 'Springfield',
      contact_ids: [4, 6],
      site_ids: [100, 101],
      job_ids: [40],
    },
    { client_id: 5, name: 'Funny Farm' },
  ] as Client[]),
  jobs$: of([{ job_id: 20 }, { job_id: 30 }, mockJob] as Job[]),
  sites$: mockSites,
};

const mockActivatedRoute = {
  paramMap: of(convertToParamMap({ id: '40' })),
};

describe('JobList', () => {
  let component: JobList;
  let fixture: ComponentFixture<JobList>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobList],
      providers: [
        provideHttpClient(),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: DataService, useValue: mockDataService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JobList);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load all data when the component is initialized', fakeAsync(() => {
      component.ngOnInit();
      tick(1000);
      fixture.detectChanges();

      expect(component.rows[2].job_number).toBe('007');
    }));
  });

  describe('Populate template', () => {
    beforeEach(fakeAsync(() => {
      component.ngOnInit();
      tick(1000);
      fixture.detectChanges();
    }));

    it('should display a table of jobs', () => {
      const tableEl = fixture.nativeElement.querySelector('ngx-datatable');
      expect(tableEl).toBeTruthy();
    });

    it('should display populated rows in the table of jobs', () => {
      const cellLabelEl = fixture.nativeElement.querySelector(
        'datatable-row-wrapper:nth-of-type(3) datatable-body-cell:nth-of-type(3) span'
      );
      expect(cellLabelEl).toBeTruthy();
      expect(cellLabelEl.innerHTML).toContain('Comedy Club');
    });
  });

  describe('Jobs table', () => {
    beforeEach(fakeAsync(() => {
      component.ngOnInit();
      tick(1000);
      fixture.detectChanges();
    }));

    it('should navigate to job detail when a job row is clicked', () => {
      const routerSpy = spyOn(router, 'navigate');
      const cellEl = fixture.nativeElement.querySelector(
        'datatable-row-wrapper:nth-of-type(3) datatable-body-cell:nth-of-type(2)'
      ) as HTMLDivElement;
      expect(cellEl).toBeTruthy();
      cellEl.dispatchEvent(new Event('click'));
      expect(routerSpy).toHaveBeenCalledOnceWith(['/jobs', 40]);
    });

    it('should not navigate to job detail when a job row is selected via the keyboard', () => {
      const routerSpy = spyOn(router, 'navigate');
      const cellEl = fixture.nativeElement.querySelector(
        'datatable-row-wrapper:nth-of-type(3) datatable-body-cell:nth-of-type(2)'
      ) as HTMLDivElement;
      expect(cellEl).toBeTruthy();
      cellEl.dispatchEvent(new Event('activate'));
      expect(routerSpy).not.toHaveBeenCalled();
    });

    it('should display the client name at a desktop screen size', fakeAsync(async () => {
      const cellEl = fixture.nativeElement.querySelector(
        'datatable-row-wrapper:nth-of-type(3) datatable-body-cell:nth-of-type(3) span.mobile-hidden'
      ) as HTMLSpanElement;
      expect(cellEl.innerHTML).toContain('Comedy Club');
      const computedStyle = window.getComputedStyle(cellEl);
      expect(computedStyle.display).toBe('inline');
    }));

    it('should call toggleExpandRow on the row detail area when called on the arrow', () => {
      const toggleRowSpy = spyOn(component.table.rowDetail!, 'toggleExpandRow');
      const row = component.rows[2];
      component.toggleExpandRow(row);
      expect(toggleRowSpy).toHaveBeenCalled();
    });

    it('should use the custom sort comparator function for sorting on the site column', () => {
      const rows = [
        { address1: '4392 Maple Ave', city: 'Carson City', state: 'NV', zip_code: '' },
        { address1: '941 Main St', city: 'Chicago', state: 'IL', zip_code: '' },
        { address1: '71 W South St', city: 'Minneapolis', state: 'MN', zip_code: '' },
        { address1: '1457 Fried Blvd', city: 'Cheyenne', state: 'WY', zip_code: '' },
        { address1: '66 Route 66', city: 'Ocala', state: 'FL', zip_code: '' },
      ];
      const expectedRows = [
        { address1: '1457 Fried Blvd', city: 'Cheyenne', state: 'WY', zip_code: '' },
        { address1: '4392 Maple Ave', city: 'Carson City', state: 'NV', zip_code: '' },
        { address1: '66 Route 66', city: 'Ocala', state: 'FL', zip_code: '' },
        { address1: '71 W South St', city: 'Minneapolis', state: 'MN', zip_code: '' },
        { address1: '941 Main St', city: 'Chicago', state: 'IL', zip_code: '' },
      ];
      const sortedList = [...rows].sort(component.addressComparator);
      expect(sortedList).toEqual(expectedRows);
    });
  });

  describe('Navigation', () => {
    it('should navigate to add job when the Add Job footer button is clicked', async () => {
      const routerSpy = spyOn(router, 'navigate');
      const addButtonEl = fixture.nativeElement.querySelector('#addBtn') as HTMLButtonElement;
      addButtonEl.click();
      expect(routerSpy).toHaveBeenCalledOnceWith(['/jobs', 'add']);
    });
  });
});
