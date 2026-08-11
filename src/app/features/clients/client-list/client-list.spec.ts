import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { of } from 'rxjs';
import { provideRouter, Router } from '@angular/router';

import { ClientList } from './client-list';
import { IClient } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { AddClient } from '../add-client/add-client';
import { Component, input } from '@angular/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

const mockRows = [
  { client_id: 2 },
  { client_id: 4 },
  {
    client_id: 6,
    name: 'Comedy Club',
    city: 'Walla Walla',
    state: 'WA',
    industry: 'Comedy',
    job_ids: [3],
    contact_ids: [11]
  }
] as IClient[];

const mockColumns = [
  {
    width: 50
  },
  { width: 300, prop: 'name', name: 'Name' }
];

@Component({
  selector: 'ngx-datatable',
  standalone: true,
  template: '<div>Mock Datatable</div>'
})
export class MockDatatableComponent {
  scrollbarV = input<boolean>(true);
  rows = input<any[]>([]);
  columns = input<any[]>([]);
}

@Component({
  selector: 'app-host',
  standalone: true,
  imports: [NgxDatatableModule],
  template: `<ngx-datatable
    [scrollbarV]="scrollbarV"
    [rows]="rows"
    [columns]="columns"
  ></ngx-datatable>`
})
export class MockHostComponent {
  scrollbarV = true;
  rows = [...mockRows];
  columns = [...mockColumns];
}

const mockDataService = {
  clients$: of(mockRows)
};

describe('ClientList', () => {
  let fixture: ComponentFixture<ClientList>;
  let component: ClientList;
  let hostFixture: ComponentFixture<MockHostComponent>;
  let hostComponent: MockHostComponent;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientList],
      providers: [
        provideHttpClient(withXhr()),
        { provide: DataService, useValue: mockDataService },
        provideRouter([{ path: 'clients/add', component: AddClient }])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientList);
    component = fixture.componentInstance;
    hostFixture = TestBed.createComponent(MockHostComponent);
    hostComponent = hostFixture.componentInstance;
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

    fit('should display populated rows in the table of clients', () => {
      hostComponent.scrollbarV = false;
      hostFixture.detectChanges();

      const cellLabelEl = hostFixture.nativeElement.querySelector(
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
        { city: 'Springfield', state: 'IL' }
      ];
      const expectedRows = [
        { city: 'Anchorage', state: 'AK' },
        { city: 'Biloxi', state: 'MS' },
        { city: 'Carson City', state: 'NV' },
        { city: 'Springfield', state: 'IL' },
        { city: 'Springfield', state: 'OH' }
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
