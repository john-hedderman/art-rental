import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ContactsTable } from './contacts-table';
import { Contact } from '../../../model/models';
import { Router } from '@angular/router';
import { Util } from '../../util/util';

const mockRows = [
  { contact_id: 10, client_id: 6, first_name: 'Drac', last_name: 'Ula' },
  { contact_id: 11, client_id: 6, first_name: 'Frank', last_name: 'Stein' },
  { contact_id: 12, client_id: 6, first_name: 'The', last_name: 'Mummy' },
] as Contact[];

describe('ContactsTable', () => {
  let component: ContactsTable;
  let fixture: ComponentFixture<ContactsTable>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactsTable],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactsTable);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  beforeEach(() => {
    component.rows = [...mockRows];
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Sorting', () => {
    // revisit this test after making it work in the app with only two values, like a normal comparator does
    //    otherwise must test it as is - with 4 arguments to suit ngx-datatable
    xit('should use the custom sort comparator function for sorting on the name column', () => {
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
      // const sortedList = [...rows].sort(component.nameComparator);
      // expect(sortedList).toEqual(expectedRows);
    });

    // revisit this test after making it work in the app with only two values, like a normal comparator does
    //    otherwise must test it as is - with 4 arguments to suit ngx-datatable
    xit('should use the custom sort comparator function for sorting on the client (name) column', () => {
      const rows = [
        { contact_id: 4, client: { name: 'Second City ' } },
        { contact_id: 2, client: { name: 'Funny Farm' } },
        { contact_id: 6, client: { name: 'Comedy Club ' } },
      ];
      const expectedRows = [
        { contact_id: 6, client: { name: 'Comedy Club ' } },
        { contact_id: 2, client: { name: 'Funny Farm' } },
        { contact_id: 4, client: { name: 'Second City ' } },
      ];
      // const sortedList = [...rows].sort(component.clientNameComparator);
      // expect(sortedList).toEqual(expectedRows);
    });
  });

  describe('Row detail', () => {
    // this test works whether returning a mobile width or a greater one
    // so need to revisit and investigate not seeing any after-effects from window.resize
    it('should toggle row detail when clicking the first column arrow in mobile mode', fakeAsync(() => {
      const toggleExpandSpy = spyOn(component, 'toggleExpandRow');

      spyOnProperty(window, 'innerWidth', 'get').and.returnValue(400);
      window.dispatchEvent(new Event('resize'));
      tick(1000);
      fixture.detectChanges();

      const arrowEl = fixture.nativeElement.querySelector(
        'datatable-row-wrapper:nth-of-type(1) datatable-body-cell:nth-of-type(1) a'
      ) as HTMLAnchorElement;
      arrowEl.click();
      tick(1000);
      fixture.detectChanges();

      expect(toggleExpandSpy).toHaveBeenCalled();
    }));

    it('should call toggleExpandRow on the row detail area when called on the arrow', () => {
      const toggleRowSpy = spyOn(component.table.rowDetail!, 'toggleExpandRow');
      const row = component.rows[0];
      component.toggleExpandRow(row);
      expect(toggleRowSpy).toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    // not working - we mock 3 rows of contacts but it says we have only the first of those 3
    //    table input scrollbarV is the culprit, though root cause not known - take it out and this test works
    //    may have resolved this in the app with style changes
    //    see other comments in skipped tests about style sheets not importing with @use
    xit('should display the correct number of rows', () => {
      const rowElements = fixture.nativeElement.querySelectorAll('.datatable-body-row');
      expect(rowElements.length).toBe(mockRows.length);
    });

    it('should navigate to contact detail when a contact row is clicked', () => {
      const routerSpy = spyOn(router, 'navigate');
      const cellEl = fixture.nativeElement.querySelector(
        'datatable-row-wrapper:nth-of-type(1) datatable-body-cell:nth-of-type(2)'
      );
      expect(cellEl).toBeTruthy();
      cellEl.dispatchEvent(new Event('click'));
      expect(routerSpy).toHaveBeenCalledOnceWith(['/contacts', 10]);
    });

    it('should not navigate to contact detail when a contact row is selected via the keyboard', () => {
      const routerSpy = spyOn(router, 'navigate');
      const cellEl = fixture.nativeElement.querySelector(
        'datatable-row-wrapper:nth-of-type(1) datatable-body-cell:nth-of-type(2)'
      );
      expect(cellEl).toBeTruthy();
      cellEl.dispatchEvent(new Event('activate'));
      expect(routerSpy).not.toHaveBeenCalled();
    });
  });
});
