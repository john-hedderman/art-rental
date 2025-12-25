import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { BehaviorSubject, of, ReplaySubject } from 'rxjs';

import { SiteDetail } from './site-detail';
import { Client, Job, Site } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/strings';
import { Util } from '../../../shared/util/util';

const mockSite = { site_id: 100, name: 'Auditorium', client_id: 3, job_id: 40 };

const mockSites = of([
  mockSite,
  { site_id: 101, client_id: 3, job_id: 0 },
  { site_id: 102, job_id: 0 },
] as Site[]);

const mockJob = {
  job_id: 40,
  job_number: '007',
  client_id: 3,
  site_id: 100,
  contact_ids: [4, 6],
  art_ids: [11, 12],
};

const mockJobs = of([{ job_id: 20 }, { job_id: 30 }, mockJob] as Job[]);

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
  jobs$: mockJobs,
  sites$: mockSites,
  reloadData: () => {},
  deleteDocument: () => Promise.resolve({ deletedCount: 1 }),
  saveDocument: () => Promise.resolve({ modifiedCount: 1 }),
};

const mockActivatedRoute = {
  paramMap: of(convertToParamMap({ id: '100' })),
};

describe('SiteDetail', () => {
  let component: SiteDetail;
  let fixture: ComponentFixture<SiteDetail>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteDetail],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: DataService, useValue: mockDataService },
      ],
    }).compileComponents();

    mockDataService.sites$ = mockSites;
    mockDataService.jobs$ = mockJobs;
    fixture = TestBed.createComponent(SiteDetail);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load all data when the component is initialized', fakeAsync(() => {
      mockDataService.sites$ = mockSites;

      expect(component.siteId).toBe(100);
      expect(component.clients[1].city).toBe('Springfield');
      expect(component.clients[2].name).toBe('Funny Farm');
      expect(component.site!.name).toBe('Auditorium');
    }));
  });

  describe('Populate template', () => {
    beforeEach(fakeAsync(() => {
      mockDataService.sites$ = mockSites;
      tick(1000);
      fixture.detectChanges();
    }));

    it('should display the site name', () => {
      const siteNameEl = fixture.nativeElement.querySelector('.ar-site-detail__site-name');
      expect(siteNameEl.innerHTML).toBe('Auditorium');
    });

    it('should display the client name, hyperlinked', () => {
      const siteNameEl = fixture.nativeElement.querySelector('.ar-site-detail__client-name a');
      expect(siteNameEl.innerHTML).toBe('Comedy Club');
    });

    it('should display the job number if assigned to a job', fakeAsync(() => {
      mockDataService.sites$ = of([mockSite] as Site[]);
      const siteNameEl = fixture.nativeElement.querySelector('.ar-site-detail__job-number');
      expect(siteNameEl.innerHTML).toBe('007');
    }));

    it('should display TBD if there is no assigned job', fakeAsync(() => {
      component.job = undefined;
      tick(1000);
      fixture.detectChanges();

      mockDataService.jobs$ = new ReplaySubject<Job[]>(undefined);
      const siteNameEl = fixture.nativeElement.querySelector('.ar-site-detail__job-number');
      expect(siteNameEl.innerHTML).toContain('TBD');
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

    describe('Delete site', () => {
      afterEach(() => {
        mockDataService.deleteDocument = () => Promise.resolve({ deletedCount: 1 });
      });

      it('should delete the site', async () => {
        const deleteSiteResult = await component.deleteSite();
        expect(deleteSiteResult).toEqual(Const.SUCCESS);
      });

      it('should fail to delete the site if nothing was deleted in the database', async () => {
        mockDataService.deleteDocument = () => Promise.resolve({ deletedCount: 0 });
        const deleteSiteResult = await component.deleteSite();
        expect(deleteSiteResult).toEqual(Const.FAILURE);
      });
    });

    describe('Update job', () => {
      afterEach(() => {
        mockDataService.saveDocument = () => Promise.resolve({ modifiedCount: 1 });
        component.jobId = 40;
      });

      it('should update the job', async () => {
        const updateJobResult = await component.updateJob();
        expect(updateJobResult).toBe(Const.SUCCESS);
      });

      it('should skip updating the job if there is no active job', async () => {
        component.site!.job_id = Const.NO_JOB;
        const updateJobResult = await component.updateJob();
        expect(updateJobResult).toBe(Const.SUCCESS);
      });

      it('should fail to update the job if it cannot be found in the database', async () => {
        component.jobId = 0;
        const updateJobResult = await component.updateJob();
        expect(updateJobResult).toBe(Const.FAILURE);
      });

      it('should fail to update the job if nothing was modified in the database', async () => {
        mockDataService.saveDocument = () => Promise.resolve({ modifiedCount: 0 });
        const updateJobResult = await component.updateJob();
        expect(updateJobResult).toBe(Const.FAILURE);
      });
    });

    describe('Update client', () => {
      beforeEach(() => {
        mockDataService.saveDocument = () => Promise.resolve({ modifiedCount: 1 });
        component.clientId = 3;
        component.siteId = 100;
      });

      afterEach(() => {
        mockDataService.saveDocument = () => Promise.resolve({ modifiedCount: 1 });
        component.clientId = 3;
        component.siteId = 100;
      });

      it('should update the client', async () => {
        const updateClientResult = await component.updateClient();
        expect(updateClientResult).toBe(Const.SUCCESS);
      });

      it('should fail to update the client if it cannot be found in the database', async () => {
        component.clientId = 99;
        component.siteId = 100;
        const updateClientResult = await component.updateClient();
        expect(updateClientResult).toBe(Const.FAILURE);
      });

      it('should skip updating the client if it does not own the site', async () => {
        component.clientId = 3;
        component.siteId = 99;
        const updateClientResult = await component.updateClient();
        expect(updateClientResult).toBe(Const.SUCCESS);
      });

      it('should fail to update the client if nothing was modified in the database', fakeAsync(async () => {
        component.clientId = 3;
        component.siteId = 100;
        mockDataService.saveDocument = () => Promise.resolve({ modifiedCount: 0 });
        const updateClientResult = await component.updateClient();
        expect(updateClientResult).toBe(Const.FAILURE);
      }));
    });

    describe('After delete', () => {
      function showStatus() {
        component['messagesService'].showStatus(
          component.deleteStatus,
          Util.replaceTokens(Msgs.DELETED, { entity: 'site' }),
          Util.replaceTokens(Msgs.DELETE_FAILED, { entity: 'site' })
        );
        tick(1000);
        fixture.detectChanges();
      }

      it('should show a status message for a successful delete', fakeAsync(() => {
        component.deleteStatus = Const.SUCCESS;
        showStatus();
        const statusMessageEl = fixture.nativeElement.querySelector('.text-success');
        expect(statusMessageEl).toBeTruthy();
      }));

      it('should show a status message for a failed delete', fakeAsync(() => {
        component.deleteStatus = Const.FAILURE;
        showStatus();
        const statusMessageEl = fixture.nativeElement.querySelector('.text-danger');
        expect(statusMessageEl).toBeTruthy();
      }));
    });

    describe('Comprehensive delete function', () => {
      it('should denote success if the job was deleted and related data was updated', async () => {
        component.deleteSite = async () => Const.SUCCESS;
        component.updateJob = async () => Const.SUCCESS;
        component.updateClient = async () => Const.SUCCESS;

        const deleteStatus = await component.delete();
        expect(deleteStatus).toBe(Const.SUCCESS);
      });

      it('should denote failure if the job was deleted but some related data was not updated', async () => {
        component.deleteSite = async () => Const.SUCCESS;
        component.updateJob = async () => Const.FAILURE;
        component.updateClient = async () => Const.SUCCESS;

        const deleteStatus = await component.delete();
        expect(deleteStatus).toBe(Const.FAILURE);
      });

      it('should denote failure if the job was not deleted', async () => {
        component.deleteSite = async () => Const.FAILURE;
        component.updateJob = async () => Const.FAILURE;
        component.updateClient = async () => Const.FAILURE;

        const deleteStatus = await component.delete();
        expect(deleteStatus).toBe(Const.FAILURE);
      });
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

      it('should navigate to the edit site page when the Edit button in the page footer is clicked', async () => {
        const routerSpy = spyOn(router, 'navigate');
        const editSiteButtonEl = fixture.nativeElement.querySelector(
          '#editBtn'
        ) as HTMLButtonElement;
        editSiteButtonEl.click();
        expect(routerSpy).toHaveBeenCalledOnceWith(['/sites', 100, 'edit']);
      });
    });
  });
});
