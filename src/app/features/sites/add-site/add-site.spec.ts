import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { FormGroup } from '@angular/forms';

import { AddSite } from './add-site';
import { Client, Job, Site } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/strings';
import { Util } from '../../../shared/util/util';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SiteList } from '../site-list/site-list';

const mockClient = {
  client_id: 3,
  name: 'Comedy Club',
  city: 'Springfield',
  contact_ids: [4, 6],
  job_ids: [40],
  site_ids: [],
};

const mockJob = {
  job_id: 40,
  job_number: '007',
  client_id: 3,
  site_id: 100,
  contact_ids: [4, 6],
  art_ids: [11, 12],
};

const mockDataService = {
  clients$: of([
    { client_id: 1, name: 'Second City' },
    mockClient,
    { client_id: 5, name: 'Funny Farm' },
  ] as Client[]),
  jobs$: of([{ job_id: 20 }, { job_id: 30 }, mockJob] as Job[]),
  saveDocument: () => Promise.resolve({ modifiedCount: 1 }),
  reloadData: () => {},
};

const route = {
  snapshot: {
    paramMap: {
      get: (key: string) => '100',
    },
  },
} as ActivatedRoute;

const siteForm = {
  value: {
    site_id: 100,
    name: 'Auditorium',
    client_id: 3,
    job_id: 40,
  },
  get: (key: string) => {},
} as FormGroup;

describe('AddSite', () => {
  let component: AddSite;
  let fixture: ComponentFixture<AddSite>;
  let httpTestingController: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSite],
      providers: [
        provideRouter([{ path: 'sites/list', component: SiteList }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DataService, useValue: mockDataService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddSite);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
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

      expect(component.clients[1].name).toBe('Comedy Club');
      expect(component.jobs[2].job_number).toBe('007');
    }));

    it('should populate the form during initialization if in edit mode', fakeAsync(() => {
      component.route = route;
      const populateFormSpy = spyOn(component, 'populateForm');

      component.init();
      tick(1000);
      fixture.detectChanges();

      expect(populateFormSpy).toHaveBeenCalledWith('sites', 'site_id', 100);
      expect(component.headerData.data.headerTitle).toBe('Edit Site');
    }));
  });

  describe('Form behaviors', () => {
    it('should disable other fields if "Please select a client..." is selected in the client menu', async () => {
      const clientSelectEl = fixture.nativeElement.querySelector('#client_id') as HTMLSelectElement;
      clientSelectEl.value = '';
      clientSelectEl.dispatchEvent(new Event('change'));

      fixture.detectChanges();
      await fixture.whenStable();

      const address1El = fixture.nativeElement.querySelector('#address1') as HTMLInputElement;
      expect(address1El.disabled).toBeTrue();
    });

    it('should enable other fields if a client is selected in the client menu', async () => {
      const clientSelectEl = fixture.nativeElement.querySelector('#client_id') as HTMLSelectElement;
      clientSelectEl.value = '3';
      clientSelectEl.dispatchEvent(new Event('change'));

      fixture.detectChanges();
      await fixture.whenStable();

      const address1El = fixture.nativeElement.querySelector('#address1') as HTMLInputElement;
      expect(address1El.disabled).toBeFalse();
    });
  });

  describe('Form submission: before save', () => {
    it('should disable the Save button', () => {
      component.preSave();
      expect(component.saveBtn.disabled).toBeTrue();
    });

    it('should set the site ID in the form to the route ID when in edit mode', () => {
      component.route = route;
      component.preSave();
      expect(component.siteForm.value.site_id).toEqual(100);
    });

    it('should set the site ID in the form to the date in ms when in add mode', () => {
      component.route = {
        snapshot: {
          paramMap: {
            get: (key: string) => null,
          },
        },
      } as ActivatedRoute;
      component.preSave();
      expect(component.siteForm.value.site_id).not.toEqual(100);
    });
  });

  describe('Form submission: save site', () => {
    beforeEach(() => {
      component.editMode = false;
      component.siteForm = siteForm;
      component.dataService.saveDocument = () => Promise.resolve({ modifiedCount: 1 });
    });

    it('should save the site', async () => {
      let saveSiteResult = await component.saveSite();
      expect(saveSiteResult).toEqual(Const.SUCCESS);
    });

    it('should save the site in edit mode', async () => {
      component.editMode = true;
      let saveSiteResult = await component.saveSite();
      expect(saveSiteResult).toEqual(Const.SUCCESS);
    });

    it('should fail to save the site if nothing was modified in the database', async () => {
      component.dataService.saveDocument = () => Promise.resolve({ modifiedCount: 0 });
      let saveSiteResult = await component.saveSite();
      expect(saveSiteResult).toEqual(Const.FAILURE);
    });
  });

  describe('Form submission: update client', () => {
    beforeEach(fakeAsync(() => {
      component.editMode = false;
      component.siteForm.value.client_id = 3;
      component.dataService.saveDocument = () => Promise.resolve({ modifiedCount: 1 });
      tick(1000);
    }));

    it('should update the client', async () => {
      let saveClientResult = await component.updateClient();
      expect(saveClientResult).toEqual(Const.SUCCESS);
    });

    it('should fail to save the client if it cannot be found in the database', async () => {
      component.siteForm = {
        value: {
          client_id: '99',
        },
      } as FormGroup;
      const saveClientResult = await component.updateClient();
      expect(saveClientResult).toEqual(Const.FAILURE);
    });

    it('should fail to save the client if nothing was modified in the database', async () => {
      component.dataService.saveDocument = () => Promise.resolve({ modifiedCount: 0 });
      const saveClientResult = await component.updateClient();
      expect(saveClientResult).toEqual(Const.FAILURE);
    });
  });

  describe('Form submission: save all data', () => {
    it('should perform all save activity', async () => {
      component.editMode = false;

      const jobSpy = spyOn(component, 'saveSite');
      const clientSpy = spyOn(component, 'updateClient');

      await component.save();

      expect(jobSpy).toHaveBeenCalled();
      expect(clientSpy).toHaveBeenCalled();
    });
  });

  describe('Form submission: after save', () => {
    beforeEach(() => {
      component.init();
      component.editMode = false;
      component.route = route;
    });

    it('should show a message with the status of the save', fakeAsync(() => {
      component.saveStatus = Const.SUCCESS;
      component.messagesService.showStatus(
        component.saveStatus,
        Util.replaceTokens(Msgs.SAVED, { entity: 'site' }),
        Util.replaceTokens(Msgs.SAVE_FAILED, { entity: 'site' })
      );
      tick(1000);
      fixture.detectChanges();

      const statusMessageEl = fixture.nativeElement.querySelector('.text-success');
      expect(statusMessageEl).toBeTruthy();
    }));

    it('should clear the message with the status of the save', fakeAsync(() => {
      component.messagesService.clearStatus();
      tick(1000);
      fixture.detectChanges();

      let statusMessageEl = fixture.nativeElement.querySelector('.status-message');
      expect(statusMessageEl).toBeFalsy();
    }));

    it('should clear the form after saving in add mode', fakeAsync(() => {
      component.onClickReset();
      tick(1000);
      fixture.detectChanges();

      const nameEl = fixture.nativeElement.querySelector('#name') as HTMLInputElement;
      expect(nameEl.value).toBe('');
      const addressEl = fixture.nativeElement.querySelector('#address1') as HTMLInputElement;
      expect(addressEl.value).toBe('');
      expect(addressEl.disabled).toBeTrue();
    }));

    it('should repopulate the form after saving in edit mode', fakeAsync(() => {
      component.editMode = true;
      component.siteId = +component.route.snapshot.paramMap.get('id')!;
      const url = `http://localhost:3000/data/sites/${component.siteId}?recordId=site_id`;
      const mockData = [
        {
          site_id: 100,
          name: 'Auditorium',
          client_id: 3,
          job_id: 40,
        } as Site,
      ];

      component.postSave('site');
      tick(1000);
      fixture.detectChanges();

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');
      req.flush(mockData);

      const nameEl = fixture.nativeElement.querySelector('#name') as HTMLInputElement;
      expect(nameEl.value).toBe('Auditorium');
    }));
  });

  describe('Form submission, comprehensive', () => {
    beforeEach(() => {
      component.route = route;
    });

    it('should perform all form submission activity (edit mode)', fakeAsync(() => {
      component.editMode = true;
      component.siteForm = component['fb'].group({
        site_id: 100,
        name: 'Auditorium',
        client_id: 3,
        job_id: 40,
      });

      const preSaveSpy = spyOn(component, 'preSave');
      const saveSpy = spyOn(component, 'save');
      const postSaveSpy = spyOn(component, 'postSave');

      component.siteForm.clearAsyncValidators();
      component.siteForm.clearValidators();
      component.siteForm.updateValueAndValidity();

      component.onSubmit();

      expect(preSaveSpy).toHaveBeenCalled();
      expect(saveSpy).toHaveBeenCalled();
      tick(1000);
      expect(postSaveSpy).toHaveBeenCalled();
    }));
  });

  describe('Navigation', () => {
    it('should navigate to the site list when the Sites link in the page header is clicked', async () => {
      const routerSpy = spyOn(router, 'navigate');
      const siteListLinkEl = fixture.nativeElement.querySelector(
        '#siteListLink'
      ) as HTMLAnchorElement;
      siteListLinkEl.click();
      expect(routerSpy).toHaveBeenCalledOnceWith(['/sites', 'list']);
    });
  });
});
