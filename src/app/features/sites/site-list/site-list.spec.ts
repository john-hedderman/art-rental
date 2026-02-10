import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of } from 'rxjs';

import { SiteList } from './site-list';
import { provideHttpClient } from '@angular/common/http';
import { IClient, ISite } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { Router } from '@angular/router';

const mockClients = of([
  { client_id: 1 },
  {
    client_id: 3,
    name: 'Comedy Club',
    city: 'Springfield',
    contact_ids: [4, 6],
    site_ids: [100, 101],
    job_ids: [40]
  },
  { client_id: 5, name: 'Funny Farm' }
] as IClient[]);
const mockSites = of([
  { site_id: 100, name: 'Auditorium', client_id: 3, job_id: 40 },
  { site_id: 101, client_id: 3, job_id: 0 },
  { site_id: 102, job_id: 0 }
] as ISite[]);

const mockDataService = {
  clients$: mockClients,
  sites$: mockSites
};

describe('SiteList', () => {
  let component: SiteList;
  let fixture: ComponentFixture<SiteList>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteList],
      providers: [provideHttpClient(), { provide: DataService, useValue: mockDataService }]
    }).compileComponents();

    fixture = TestBed.createComponent(SiteList);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load all data when the component is initialized', fakeAsync(() => {
      component.init();
      tick(1000);
      fixture.detectChanges();

      expect(component.rows[0].name).toBe('Auditorium');
    }));
  });

  describe('Populate template', () => {
    beforeEach(fakeAsync(() => {
      component.init();
      tick(1000);
      fixture.detectChanges();
    }));

    it('should display a table of sites', () => {
      const tableEl = fixture.nativeElement.querySelector('ngx-datatable');
      expect(tableEl).toBeTruthy();
    });

    it('should display populated rows in the table of sites', () => {
      const cellLabelEl = fixture.nativeElement.querySelector(
        'datatable-row-wrapper:nth-of-type(1) datatable-body-cell:nth-of-type(2) .datatable-body-cell-label'
      );
      expect(cellLabelEl).toBeTruthy();
      expect(cellLabelEl.innerHTML).toContain('Auditorium');
    });
  });

  describe('Sites table', () => {
    beforeEach(fakeAsync(() => {
      component.ngOnInit();
      tick(1000);
      fixture.detectChanges();
    }));

    it('should navigate to job detail when a job row is clicked', () => {
      const routerSpy = spyOn(router, 'navigate');
      const cellEl = fixture.nativeElement.querySelector(
        'datatable-row-wrapper:nth-of-type(1) datatable-body-cell:nth-of-type(2)'
      ) as HTMLDivElement;
      expect(cellEl).toBeTruthy();
      cellEl.dispatchEvent(new Event('click'));
      expect(routerSpy).toHaveBeenCalledOnceWith(['/sites', 100]);
    });

    it('should not navigate to site detail when a site row is selected via the keyboard', () => {
      const routerSpy = spyOn(router, 'navigate');
      const cellEl = fixture.nativeElement.querySelector(
        'datatable-row-wrapper:nth-of-type(1) datatable-body-cell:nth-of-type(2)'
      ) as HTMLDivElement;
      expect(cellEl).toBeTruthy();
      cellEl.dispatchEvent(new Event('activate'));
      expect(routerSpy).not.toHaveBeenCalled();
    });

    it('should display the client name at a desktop screen size', fakeAsync(async () => {
      const cellEl = fixture.nativeElement.querySelector(
        'datatable-row-wrapper:nth-of-type(1) datatable-body-cell:nth-of-type(4) span.mobile-hidden'
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
        { address1: '66 Route 66', city: 'Ocala', state: 'FL', zip_code: '' }
      ];
      const expectedRows = [
        { address1: '1457 Fried Blvd', city: 'Cheyenne', state: 'WY', zip_code: '' },
        { address1: '4392 Maple Ave', city: 'Carson City', state: 'NV', zip_code: '' },
        { address1: '66 Route 66', city: 'Ocala', state: 'FL', zip_code: '' },
        { address1: '71 W South St', city: 'Minneapolis', state: 'MN', zip_code: '' },
        { address1: '941 Main St', city: 'Chicago', state: 'IL', zip_code: '' }
      ];
      const sortedList = [...rows].sort(component.addressComparator);
      expect(sortedList).toEqual(expectedRows);
    });
  });

  describe('Navigation', () => {
    it('should navigate to add site when the Add Site footer button is clicked', async () => {
      const routerSpy = spyOn(router, 'navigate');
      const addButtonEl = fixture.nativeElement.querySelector('#addBtn') as HTMLButtonElement;
      addButtonEl.click();
      expect(routerSpy).toHaveBeenCalledOnceWith(['/sites', 'add']);
    });
  });
});
