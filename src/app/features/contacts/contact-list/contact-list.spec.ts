import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { Router } from '@angular/router';

import { ContactList } from './contact-list';
import { Client, Contact } from '../../../model/models';
import { DataService } from '../../../service/data-service';

const mockDataService = {
  clients$: of([
    { client_id: 1, name: 'Second City' },
    { client_id: 3, name: 'Comedy Club', city: 'Springfield', contact_ids: [4, 6] },
    { client_id: 5, name: 'Funny Farm' },
  ] as Client[]),
  contacts$: of([
    { contact_id: 2, client_id: 5, first_name: 'Drac', last_name: 'Ula', title: 'Bloodsucker' },
    { contact_id: 4, client_id: 1, first_name: '', last_name: '' },
    { contact_id: 6, client_id: 3, first_name: 'Frank', last_name: 'Stein', title: 'Scary Guy' },
  ] as Contact[]),
};

describe('ContactList', () => {
  let component: ContactList;
  let fixture: ComponentFixture<ContactList>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactList],
      providers: [provideHttpClient(), { provide: DataService, useValue: mockDataService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactList);
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

      expect(component.rows[2].last_name).toBe('Stein');
    }));
  });

  describe('Populate template', () => {
    beforeEach(fakeAsync(() => {
      component.init();
      tick(1000);
      fixture.detectChanges();
    }));

    it('should display a table of contacts', () => {
      const tableEl = fixture.nativeElement.querySelector('ngx-datatable');
      expect(tableEl).toBeTruthy();
    });

    it('should display populated rows in the table of contacts', () => {
      const cellLabelEl = fixture.nativeElement.querySelector(
        'datatable-row-wrapper:nth-of-type(3) datatable-body-cell:nth-of-type(2) .datatable-body-cell-label'
      );
      expect(cellLabelEl).toBeTruthy();
      expect(cellLabelEl.innerText).toBe('Frank Stein');
    });
  });

  describe('Clients table', () => {
    beforeEach(fakeAsync(() => {
      component.init();
      tick(1000);
      fixture.detectChanges();
    }));

    it('should navigate to contact detail when a contact row is clicked', () => {
      const routerSpy = spyOn(router, 'navigate');
      const cellEl = fixture.nativeElement.querySelector(
        'datatable-row-wrapper:nth-of-type(3) datatable-body-cell:nth-of-type(2)'
      ) as HTMLDivElement;
      expect(cellEl).toBeTruthy();
      cellEl.dispatchEvent(new Event('click'));
      expect(routerSpy).toHaveBeenCalledOnceWith(['/contacts', 6]);
    });

    it('should not navigate to contact detail when a contact row is selected via the keyboard', () => {
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

    it('should use the custom sort comparator function for sorting on the name column', () => {
      const rows = [
        { first_name: 'Carson', last_name: 'Dyle' },
        { first_name: 'Aaron', last_name: 'Burr' },
        { first_name: 'Timothy', last_name: 'Leary' },
        { first_name: 'George', last_name: 'Bailey' },
      ];
      const expectedRows = [
        { first_name: 'Aaron', last_name: 'Burr' },
        { first_name: 'Carson', last_name: 'Dyle' },
        { first_name: 'George', last_name: 'Bailey' },
        { first_name: 'Timothy', last_name: 'Leary' },
      ];
      const sortedList = [...rows].sort(component.nameComparator);
      expect(sortedList).toEqual(expectedRows);
    });

    it('should use the custom sort comparator function for sorting on the client (name) column', () => {
      const mockRowA = { contact_id: 4, client: { name: 'Second City ' } };
      const mockRowB = { contact_id: 2, client: { name: 'Funny Farm' } };
      const mockRowC = { contact_id: 6, client: { name: 'Comedy Club ' } };

      let result = component.clientNameComparator('', '', mockRowA, mockRowB);
      expect(result).toBe(1); // expect row B to come before row A

      result = component.clientNameComparator('', '', mockRowC, mockRowB);
      expect(result).toBe(-1); // expect row C to come before row B
    });
  });

  describe('Navigation', () => {
    it('should navigate to add contact when the Add Contact footer button is clicked', async () => {
      const routerSpy = spyOn(router, 'navigate');
      const addButtonEl = fixture.nativeElement.querySelector('#addBtn') as HTMLButtonElement;
      addButtonEl.click();
      expect(routerSpy).toHaveBeenCalledOnceWith(['/contacts', 'add']);
    });
  });
});
