import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ContactList } from './contact-list';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { Client, Contact } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { Router } from '@angular/router';
import { Util } from '../../../shared/util/util';

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

    // style sheet _row-detail.scss might not be being loaded because it does so with @use
    //    look into ensuring Karma understands the path to the file, and all files loaded with @use
    //    perhaps can be addressed in angular.json
    xit('should not display the client name at a mobile screen size', fakeAsync(async () => {
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

    // this test works whether returning a mobile width or a greater one
    // so need to revisit and investigate not seeing any after-effects from window.resize
    xit('should respond to a window resize by displaying row detail or not ', fakeAsync(() => {
      const rowDetailSpy = spyOn(Util, 'showHideRowDetail');
      spyOnProperty(window, 'innerWidth', 'get').and.returnValue(425);
      window.dispatchEvent(new Event('resize'));
      tick(3000);
      fixture.detectChanges();

      expect(rowDetailSpy).toHaveBeenCalled();
    }));

    // this test also works whether returning a mobile width or a greater one
    // so need to revisit and investigate not seeing any after-effects from window.resize
    xit('should toggle row detail when clicking the first column arrow in mobile mode', fakeAsync(() => {
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

    // sorting in the app is currently only working correctly on both the Name and Client columns when:
    //    a) the Name column definition has a prop:'' key/value pair
    //    a1) its comparator takes 2 arguments
    //    b) the Client definition does not have a prop property at all
    //    b1) its comparator takes 4 arguments
    // if you change (b) and (b1) so they work like (a) and (a1), the first column doesn't sort correctly,
    //    but instead, the Client column is the one that sorts
    // revisit this test after making it work in the app with only two values, like a normal comparator does
    //    wonder if it's an ngx-datatable bug
    //    research seems to indicate this is a known issue, only fixed by specifying the 'prop' property, and
    //    giving it a real value, not the empty string
    //    this implies that for app sorting to work, the comparator funcions must take 4 arguments
    // and so, the roadblock is here in the test, where it only wants 2 (rightfully so)
    //    research on that finds a suggestion that in the unit test, you can call the comparator function directly,
    //    not involving the 'sort' function at all
    //    look for the AI answer when searching for:
    //    "ngx-datatable angular how do you unit test custom sort comparators with four arguments"
    //    https://www.google.com/search?q=ngx-datatable+angular+how+do+you+unit+test+custom+sort+comparators+with+four+arguments
    // xit('should use the custom sort comparator function for sorting on the client (name) column', () => {
    //   const rows = [
    //     { contact_id: 4, client: { name: 'Second City ' } },
    //     { contact_id: 2, client: { name: 'Funny Farm' } },
    //     { contact_id: 6, client: { name: 'Comedy Club ' } },
    //   ];
    //   const expectedRows = [
    //     { contact_id: 6, client: { name: 'Comedy Club ' } },
    //     { contact_id: 2, client: { name: 'Funny Farm' } },
    //     { contact_id: 4, client: { name: 'Second City ' } },
    //   ];
    //   const sortedList = [...rows].sort(component.clientNameComparator);
    //   expect(sortedList).toEqual(expectedRows);
    // });
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
