import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { provideRouter, Router } from '@angular/router';

import { ClientList } from './client-list';
import { Client } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { AddClient } from '../add-client/add-client';
import { Util } from '../../../shared/util/util';

const mockDataService = {
  clients$: of([
    { client_id: 2 },
    { client_id: 4 },
    {
      client_id: 6,
      name: 'Comedy Club',
      city: 'Walla Walla',
      state: 'WA',
      industry: 'Comedy',
      job_ids: [3],
      contact_ids: [11],
    },
  ] as Client[]),
};

describe('ClientList', () => {
  let component: ClientList;
  let fixture: ComponentFixture<ClientList>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientList],
      providers: [
        provideHttpClient(),
        { provide: DataService, useValue: mockDataService },
        provideRouter([{ path: 'clients/add', component: AddClient }]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientList);
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

      expect(component.rows[2].name).toBe('Comedy Club');
    }));
  });

  describe('Populate template', () => {
    beforeEach(fakeAsync(() => {
      component.ngOnInit();
      tick(1000);
      fixture.detectChanges();
    }));

    it('should display a table of clients', () => {
      const tableEl = fixture.nativeElement.querySelector('ngx-datatable');
      expect(tableEl).toBeTruthy();
    });

    it('should display populated rows in the table of clients', () => {
      const cellLabelEl = fixture.nativeElement.querySelector(
        'datatable-row-wrapper:nth-of-type(3) datatable-body-cell:nth-of-type(2) span'
      );
      expect(cellLabelEl).toBeTruthy();
      expect(cellLabelEl.innerHTML).toBe('Comedy Club');
    });
  });

  describe('Clients table', () => {
    beforeEach(fakeAsync(() => {
      component.ngOnInit();
      tick(1000);
      fixture.detectChanges();
    }));

    it('should navigate to client detail when a client row is clicked', () => {
      const routerSpy = spyOn(router, 'navigate');
      const cellEl = fixture.nativeElement.querySelector(
        'datatable-row-wrapper:nth-of-type(3) datatable-body-cell:nth-of-type(2)'
      ) as HTMLDivElement;
      expect(cellEl).toBeTruthy();
      cellEl.dispatchEvent(new Event('click'));
      expect(routerSpy).toHaveBeenCalledOnceWith(['/clients', 6]);
    });

    it('should not navigate to client detail when a client row is selected via the keyboard', () => {
      const routerSpy = spyOn(router, 'navigate');
      const cellEl = fixture.nativeElement.querySelector(
        'datatable-row-wrapper:nth-of-type(3) datatable-body-cell:nth-of-type(2)'
      ) as HTMLDivElement;
      expect(cellEl).toBeTruthy();
      cellEl.dispatchEvent(new Event('activate'));
      expect(routerSpy).not.toHaveBeenCalled();
    });

    it('should display the client location at a desktop screen size', fakeAsync(async () => {
      const cellEl = fixture.nativeElement.querySelector(
        'datatable-row-wrapper:nth-of-type(3) datatable-body-cell:nth-of-type(3) span.mobile-hidden'
      ) as HTMLSpanElement;
      expect(cellEl.innerHTML).toContain('Walla Walla, WA');
      const computedStyle = window.getComputedStyle(cellEl);
      expect(computedStyle.display).toBe('inline');
    }));

    // believe that style sheet _row-detail.scss loaded by @use is not being loaded
    // look into ensuring Karma understands the path to the file, and all files loaded with @use
    // perhaps can be addressed in angular.json
    fit('should not display the client location at a mobile screen size', fakeAsync(async () => {
      spyOnProperty(window, 'innerWidth', 'get').and.returnValue(425);
      window.dispatchEvent(new Event('resize'));
      tick(3000);
      fixture.detectChanges();

      const cellEl = fixture.nativeElement.querySelector(
        'datatable-row-wrapper:nth-of-type(3) datatable-body-cell:nth-of-type(3) span.mobile-hidden'
      );
      const computedStyle = window.getComputedStyle(cellEl);
      expect(computedStyle.display).toBe('none');
    }));

    it('should respond to a window resize by displaying row detail or not ', fakeAsync(() => {
      const rowDetailSpy = spyOn(Util, 'showHideRowDetail');
      spyOnProperty(window, 'innerWidth', 'get').and.returnValue(425);
      window.dispatchEvent(new Event('resize'));
      tick(3000);
      fixture.detectChanges();

      expect(rowDetailSpy).toHaveBeenCalled();
    }));

    it('should toggle row detail when clicking the first column arrow in mobile mode', fakeAsync(() => {
      const toggleExpandSpy = spyOn(component, 'toggleExpandRow');

      spyOnProperty(window, 'innerWidth', 'get').and.returnValue(425);
      window.dispatchEvent(new Event('resize'));
      tick(1000);
      fixture.detectChanges();

      const arrowEl = fixture.nativeElement.querySelector(
        'datatable-row-wrapper:nth-of-type(3) datatable-body-cell:nth-of-type(1) a'
      );
      arrowEl.click();
      tick(1000);
      fixture.detectChanges();
      expect(toggleExpandSpy).toHaveBeenCalled();
    }));

    it('should call toggleExpandRow on the row detail area when called on the arrow', () => {
      const toggleRowSpy = spyOn(component.table.rowDetail!, 'toggleExpandRow');
      const row = component.rows[2];
      component.toggleExpandRow(row);
      expect(toggleRowSpy).toHaveBeenCalled();
    });

    it('should use the custom sort comparator function for sorting on the location column', () => {
      const rows = [
        { city: 'Carson City', state: 'NV' },
        { city: 'Springfield', state: 'OH' },
        { city: 'Anchorage', state: 'AK' },
        { city: 'Biloxi', state: 'MS' },
        { city: 'Springfield', state: 'IL' },
      ];
      const expectedRows = [
        { city: 'Anchorage', state: 'AK' },
        { city: 'Biloxi', state: 'MS' },
        { city: 'Carson City', state: 'NV' },
        { city: 'Springfield', state: 'IL' },
        { city: 'Springfield', state: 'OH' },
      ];
      const sortedList = [...rows].sort(component.locationComparator);
      expect(sortedList).toEqual(expectedRows);
    });
  });

  describe('Navigation', () => {
    it('should navigate to add client when the Add Client footer button is clicked', async () => {
      const routerSpy = spyOn(router, 'navigate');
      const addButtonEl = fixture.nativeElement.querySelector('#addBtn') as HTMLButtonElement;
      addButtonEl.click();
      expect(routerSpy).toHaveBeenCalledOnceWith(['/clients', 'add']);
    });
  });
});
