import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom, map, of } from 'rxjs';

import { ClientDetail } from './client-detail';
import { Client, Contact, Job, Site } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/strings';
import { Util } from '../../../shared/util/util';
import { ClientList } from '../client-list/client-list';

const mockDataService = {
  reloadData: () => {},
  clients$: of([
    { client_id: 2 },
    { client_id: 4 },
    { client_id: 6, name: 'Comedy Club', industry: 'Comedy', job_ids: [3], contact_ids: [11] },
  ] as Client[]),
  contacts$: of([
    { contact_id: 10 },
    { contact_id: 11, client_id: 6, first_name: 'Frank', last_name: 'Stein' },
    { contact_id: 12 },
  ] as Contact[]),
  jobs$: of([
    { job_id: 1 },
    { job_id: 3, client_id: 6, job_number: '000007' },
    { job_id: 5 },
  ] as Job[]),
  sites$: of([{ site_id: 50 }, { site_id: 60 }, { site_id: 70, client_id: 6 }] as Site[]),
};

const mockActivatedRoute = {
  paramMap: of(
    convertToParamMap({
      id: '6',
    })
  ),
};

describe('ClientDetail', () => {
  let component: ClientDetail;
  let fixture: ComponentFixture<ClientDetail>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientDetail],
      providers: [
        provideHttpClient(),
        provideRouter([{ path: 'clients/list', component: ClientList }]),
        { provide: DataService, useValue: mockDataService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientDetail);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load all data when the component is initialized', fakeAsync(async () => {
      component.ngOnInit();
      tick(1000);
      fixture.detectChanges();

      expect(component.clientId).toBe(6);

      const jobs = await firstValueFrom(component.jobs$!);
      expect(jobs[0].job_id).toBe(3);
      expect(jobs[0].job_number).toBe('000007');

      expect(component.contacts[0].first_name).toBe('Frank');
    }));
  });

  describe('Populate template', () => {
    beforeEach(fakeAsync(() => {
      component.ngOnInit();
      tick(1000);
      fixture.detectChanges();
    }));

    afterEach(fakeAsync(() => {
      mockDataService.sites$ = of([
        { site_id: 50 },
        { site_id: 60 },
        { site_id: 70, client_id: 6 },
      ] as Site[]);
    }));

    it('should display the client name', () => {
      const clientNameEl = fixture.nativeElement.querySelector('.ar-client-detail__client-name');
      expect(clientNameEl.innerHTML).toBe('Comedy Club');
    });

    it('should display links for the client sites when there are sites', fakeAsync(() => {
      const sitesEl = fixture.nativeElement.querySelector('.ar-client-detail__sites p');
      expect(sitesEl.innerHTML).toContain('href');
    }));

    it('should indicate no sites when there are none for the client', fakeAsync(() => {
      mockDataService.sites$ = of([] as Site[]);
      component.ngOnInit();
      tick();
      fixture.detectChanges();

      const sitesEl = fixture.nativeElement.querySelector('.ar-client-detail__sites p');
      expect(sitesEl.innerHTML).toBe('No sites');
    }));
  });

  describe('Delete', () => {
    it('should perform all top level delete function', fakeAsync(() => {
      const preDeleteSpy = spyOn(component, 'preDelete');
      const deleteSpy = spyOn(component, 'delete');
      const postDeleteSpy = spyOn(component, 'postDelete');

      component.onClickDelete();

      expect(preDeleteSpy).toHaveBeenCalled();
      expect(deleteSpy).toHaveBeenCalled();
      tick(1000);
      expect(postDeleteSpy).toHaveBeenCalled();
    }));

    describe('Delete client', () => {
      it('should delete the client', async () => {
        component.dataService.deleteDocument = () => Promise.resolve({ deletedCount: 1 });
        let deleteClientResult = await component.deleteClient();
        expect(deleteClientResult).toEqual(Const.SUCCESS);
      });
    });

    describe('Delete contacts', () => {
      it('should delete the client contacts', async () => {
        component.dataService.deleteDocuments = () => Promise.resolve({ deletedCount: 1 });
        let deleteContactsResult = await component.deleteContacts();
        expect(deleteContactsResult).toEqual(Const.SUCCESS);
      });
    });

    describe('Delete sites', () => {
      it('should delete the client sites', async () => {
        component.dataService.deleteDocuments = () => Promise.resolve({ deletedCount: 1 });
        let deleteSitesResult = await component.deleteSites();
        expect(deleteSitesResult).toEqual(Const.SUCCESS);
      });
    });

    describe('After delete', () => {
      it('should show a message with the status of the delete', fakeAsync(() => {
        component.deleteStatus = Const.SUCCESS;
        component['messagesService'].showStatus(
          component.deleteStatus,
          Util.replaceTokens(Msgs.DELETED, { entity: 'client' }),
          Util.replaceTokens(Msgs.DELETE_FAILED, { entity: 'client' })
        );
        tick(1000);
        fixture.detectChanges();
        const statusMessageEl = fixture.nativeElement.querySelector('.text-success');
        expect(statusMessageEl).toBeTruthy();
      }));

      it('should clear the message with the status of the delete', fakeAsync(() => {
        component.postDelete();
        tick(1000);
        fixture.detectChanges();
        let statusMessageEl = fixture.nativeElement.querySelector('.status-message');
        expect(statusMessageEl).toBeFalsy();
      }));
    });

    describe('Comprehensive delete function', () => {
      it('should denote success if the client was deleted', async () => {
        component.deleteClient = async () => Const.SUCCESS;
        component.deleteContacts = async () => Const.SUCCESS;
        component.deleteSites = async () => Const.SUCCESS;

        const deleteStatus = await component.delete();
        expect(deleteStatus).toBe(Const.SUCCESS);
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to the edit client page when the Edit button in the page footer is clicked', async () => {
      const routerSpy = spyOn(router, 'navigate');
      const clientListLinkEl = fixture.nativeElement.querySelector(
        '#clientListLink'
      ) as HTMLAnchorElement;
      clientListLinkEl.click();
      expect(routerSpy).toHaveBeenCalledOnceWith(['/clients', 'list']);
    });

    it('should navigate to the client list when the Clients link in the page header is clicked', async () => {
      const routerSpy = spyOn(router, 'navigate');
      const editClientLinkEl = fixture.nativeElement.querySelector('#editBtn') as HTMLButtonElement;
      editClientLinkEl.click();
      expect(routerSpy).toHaveBeenCalledOnceWith(['/clients', 6, 'edit']);
    });
  });
});
