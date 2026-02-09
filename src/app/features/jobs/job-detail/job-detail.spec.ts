import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { JobDetail } from './job-detail';
import { IArt, IClient, Contact, Job, Site } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/strings';
import { Util } from '../../../shared/util/util';

const mockWarehouse = {
  job_id: 1,
  job_number: 'No job',
  client_id: 0,
  site_id: 0,
  contact_ids: [],
  art_ids: [101, 102, 103]
};

const mockJob = {
  job_id: 40,
  job_number: '007',
  client_id: 3,
  site_id: 100,
  contact_ids: [4, 6],
  art_ids: [11, 12]
};

const mockJobsNoWarehouse = of([{ job_id: 20 }, { job_id: 30 }, mockJob] as Job[]);

const mockJobs = of([mockWarehouse, { job_id: 20 }, { job_id: 30 }, mockJob] as Job[]);

const mockArtwork = of([
  { art_id: 10 },
  { art_id: 11, job_id: 40 },
  { art_id: 12, job_id: 40 }
] as IArt[]);

const mockNoArtwork = of([] as IArt[]);

const mockSites = of([
  { site_id: 100, name: 'Auditorium', client_id: 3, job_id: 40 },
  { site_id: 101, client_id: 3, job_id: 0 },
  { site_id: 102, job_id: 0 }
] as Site[]);

const mockDataService = {
  art$: mockArtwork,
  clients$: of([
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
  ] as IClient[]),
  contacts$: of([
    { contact_id: 2 },
    { contact_id: 4, client_id: 3 },
    { contact_id: 6, client_id: 3, first_name: 'Frank', last_name: 'Stein', title: 'Scary Guy' }
  ] as Contact[]),
  jobs$: mockJobs,
  sites$: mockSites,
  reloadData: () => {},
  deleteDocument: () => Promise.resolve({ deletedCount: 1 }),
  saveDocument: () => Promise.resolve({ modifiedCount: 1 })
};

const mockActivatedRoute = {
  paramMap: of(convertToParamMap({ id: '40' }))
};

describe('JobDetail', () => {
  let component: JobDetail;
  let fixture: ComponentFixture<JobDetail>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobDetail],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: DataService, useValue: mockDataService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(JobDetail);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load all data when the component is initialized', fakeAsync(async () => {
      mockDataService.art$ = mockArtwork;
      component.init();
      tick(1000);
      fixture.detectChanges();

      expect(component.jobId).toBe(40);
      expect(component.clients[2].name).toBe('Funny Farm');
      expect(component.artwork[1].job_id).toBe(40);
      expect(component.clients[1].city).toBe('Springfield');
      expect(component.job!.contacts![1].title).toBe('Scary Guy');
    }));
  });

  describe('Populate template', () => {
    beforeEach(fakeAsync(() => {
      component.init();
      tick(1000);
      fixture.detectChanges();
    }));

    afterEach(fakeAsync(() => {
      mockDataService.art$ = mockArtwork;
    }));

    it('should display the job number', () => {
      const jobNumberEl = fixture.nativeElement.querySelector('.ar-job-detail__job-number');
      expect(jobNumberEl.innerHTML).toBe('007');
    });

    it('should display the client name', () => {
      const clientNameEl = fixture.nativeElement.querySelector('.ar-job-detail__client-name a');
      expect(clientNameEl.innerHTML).toBe('Comedy Club');
    });

    it('should display the site name', () => {
      const siteNameEl = fixture.nativeElement.querySelector('.ar-job-detail__site-name');
      expect(siteNameEl.innerHTML).toContain('Auditorium');
    });

    it('should display TBD if there is no assigned site', fakeAsync(() => {
      component.job!.site = undefined;
      tick(1000);
      fixture.detectChanges();
      const siteNameEl = fixture.nativeElement.querySelector('.ar-job-detail__site-name');
      expect(siteNameEl.innerHTML).toContain('TBD');
    }));

    it('should display a table of contacts', () => {
      const tableEl = fixture.nativeElement.querySelector('ngx-datatable');
      expect(tableEl).toBeTruthy();
    });

    it('should display art thumbnail cards if there is art assigned to the job', fakeAsync(() => {
      const artEl = fixture.nativeElement.querySelector('.ar-job-detail__art');
      expect(artEl.innerHTML).toContain('app-art-thumbnail-card');
    }));

    it('should display TBD if there is no art assigned to the job', fakeAsync(() => {
      mockDataService.art$ = mockNoArtwork;
      component.init();
      tick(1000);
      fixture.detectChanges();
      const artEl = fixture.nativeElement.querySelector('.ar-job-detail__art');
      expect(artEl.innerHTML).toContain('TBD');
    }));
  });

  describe('Contacts table', () => {
    it('should navigate to contact detail when a contact row is clicked', () => {
      const routerSpy = spyOn(router, 'navigate');
      const cellEl = fixture.nativeElement.querySelector(
        'datatable-row-wrapper:nth-of-type(1) datatable-body-cell:nth-of-type(2)'
      ) as HTMLDivElement;
      expect(cellEl).toBeTruthy();
      cellEl.dispatchEvent(new Event('click'));
      expect(routerSpy).toHaveBeenCalledOnceWith(['/contacts', 4]);
    });

    it('should display the client name at a desktop screen size', fakeAsync(async () => {
      const cellEl = fixture.nativeElement.querySelector(
        'datatable-row-wrapper:nth-of-type(1) datatable-body-cell:nth-of-type(3) span.mobile-hidden'
      ) as HTMLSpanElement;
      expect(cellEl.innerHTML).toContain('Comedy Club');
      const computedStyle = window.getComputedStyle(cellEl);
      expect(computedStyle.display).toBe('inline');
    }));

    it('should use the custom sort comparator function for sorting on the name column', () => {
      const rows = [
        { first_name: 'Carson', last_name: 'Dyle' },
        { first_name: 'Aaron', last_name: 'Burr' },
        { first_name: 'Timothy', last_name: 'Leary' },
        { first_name: 'George', last_name: 'Bailey' }
      ];
      const expectedRows = [
        { first_name: 'Aaron', last_name: 'Burr' },
        { first_name: 'Carson', last_name: 'Dyle' },
        { first_name: 'George', last_name: 'Bailey' },
        { first_name: 'Timothy', last_name: 'Leary' }
      ];
      const sortedList = [...rows].sort(component.nameComparator);
      expect(sortedList).toEqual(expectedRows);
    });
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

    describe('Delete job', () => {
      afterEach(() => {
        mockDataService.deleteDocument = () => Promise.resolve({ deletedCount: 1 });
      });

      it('should delete the job', async () => {
        const deleteJobResult = await component.deleteJob();
        expect(deleteJobResult).toEqual(Const.SUCCESS);
      });

      it('should fail to delete the job if nothing was deleted in the database', async () => {
        mockDataService.deleteDocument = () => Promise.resolve({ deletedCount: 0 });
        const deleteJobResult = await component.deleteJob();
        expect(deleteJobResult).toEqual(Const.FAILURE);
      });
    });

    describe('Update warehouse', () => {
      afterEach(() => {
        mockDataService.saveDocument = () => Promise.resolve({ modifiedCount: 1 });
        mockDataService.jobs$ = mockJobs;
      });

      it('should update the warehouse', async () => {
        const updateWarehouseResult = await component.updateWarehouse();
        expect(updateWarehouseResult).toBe(Const.SUCCESS);
      });

      it('should fail to update the warehouse if it cannot be found in the database', fakeAsync(async () => {
        mockDataService.jobs$ = mockJobsNoWarehouse;
        component.init();
        tick(1000);
        fixture.detectChanges();

        const updateWarehouseResult = await component.updateWarehouse();
        expect(updateWarehouseResult).toBe(Const.FAILURE);
      }));

      it('should fail to update the warehouse if nothing was modified in the database', async () => {
        mockDataService.saveDocument = () => Promise.resolve({ modifiedCount: 0 });
        const updateWarehouseResult = await component.updateWarehouse();
        expect(updateWarehouseResult).toBe(Const.FAILURE);
      });
    });

    describe('Update client', () => {
      afterEach(() => {
        mockDataService.saveDocument = () => Promise.resolve({ modifiedCount: 1 });
        component.clientId = 3;
      });

      it('should update the client', async () => {
        const updateClientResult = await component.updateClient();
        expect(updateClientResult).toBe(Const.SUCCESS);
      });

      it('should fail to update the client if it cannot be found in the database', async () => {
        component.clientId = 99;
        const updateClientResult = await component.updateClient();
        expect(updateClientResult).toBe(Const.FAILURE);
      });

      it('should fail to update the client if nothing was modified in the database', async () => {
        mockDataService.saveDocument = () => Promise.resolve({ modifiedCount: 0 });
        const updateClientResult = await component.updateClient();
        expect(updateClientResult).toBe(Const.FAILURE);
      });
    });

    describe('Update site', () => {
      afterEach(() => {
        mockDataService.saveDocument = () => Promise.resolve({ modifiedCount: 1 });
        mockDataService.sites$ = mockSites;
        component.job!.site_id = 100;
      });

      it('should update the site', async () => {
        const updateSiteResult = await component.updateSite();
        expect(updateSiteResult).toBe(Const.SUCCESS);
      });

      it('should skip updating the site if it is TBD', async () => {
        component.job!.site_id = Const.TBD;
        const updateSiteResult = await component.updateSite();
        expect(updateSiteResult).toBe(Const.SUCCESS);
      });

      it('should fail to update the site if it cannot be found in the database', fakeAsync(async () => {
        mockDataService.sites$ = of([{ site_id: 1, job_id: 1 }] as Site[]);
        component.init();
        tick(1000);
        const updateSiteResult = await component.updateSite();
        expect(updateSiteResult).toBe(Const.FAILURE);
      }));

      it('should fail to update the site if nothing was modified in the database', async () => {
        mockDataService.saveDocument = () => Promise.resolve({ modifiedCount: 0 });
        const updateSiteResult = await component.updateSite();
        expect(updateSiteResult).toBe(Const.FAILURE);
      });
    });

    describe('Update art', () => {
      afterEach(() => {
        mockDataService.saveDocument = () => Promise.resolve({ modifiedCount: 1 });
      });

      it('should update the art', async () => {
        const updateArtResult = await component.updateArt();
        expect(updateArtResult).toBe(Const.SUCCESS);
      });

      it('should fail to update the art if nothing was modified in the database', async () => {
        mockDataService.saveDocument = () => Promise.resolve({ modifiedCount: 0 });
        const updateArtResult = await component.updateArt();
        expect(updateArtResult).toBe(Const.FAILURE);
      });
    });

    describe('After delete', () => {
      function showStatus() {
        component['messagesService'].showStatus(
          component.deleteStatus,
          Util.replaceTokens(Msgs.DELETED, { entity: 'job' }),
          Util.replaceTokens(Msgs.DELETE_FAILED, { entity: 'job' })
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

      it('should clear the message with the status of the delete', fakeAsync(() => {
        component.postDelete();
        tick(1000);
        fixture.detectChanges();
        let statusMessageEl = fixture.nativeElement.querySelector('.status-message');
        expect(statusMessageEl).toBeFalsy();
      }));
    });

    describe('Comprehensive delete function', () => {
      it('should denote success if the job was deleted and related data was updated', async () => {
        component.deleteJob = async () => Const.SUCCESS;
        component.updateWarehouse = async () => Const.SUCCESS;
        component.updateClient = async () => Const.SUCCESS;
        component.updateSite = async () => Const.SUCCESS;
        component.updateArt = async () => Const.SUCCESS;

        const deleteStatus = await component.delete();
        expect(deleteStatus).toBe(Const.SUCCESS);
      });

      it('should denote failure if the contact was deleted but some related data was not updated', async () => {
        component.deleteJob = async () => Const.SUCCESS;
        component.updateWarehouse = async () => Const.SUCCESS;
        component.updateClient = async () => Const.SUCCESS;
        component.updateSite = async () => Const.FAILURE;
        component.updateArt = async () => Const.SUCCESS;

        const deleteStatus = await component.delete();
        expect(deleteStatus).toBe(Const.FAILURE);
      });

      it('should denote failure if the job was not deleted', async () => {
        component.deleteJob = async () => Const.FAILURE;
        component.updateClient = async () => Const.FAILURE;
        component.updateSite = async () => Const.FAILURE;
        component.updateArt = async () => Const.FAILURE;

        const deleteStatus = await component.delete();
        expect(deleteStatus).toBe(Const.FAILURE);
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to the job list when the Jobs link in the page header is clicked', async () => {
      const routerSpy = spyOn(router, 'navigate');
      const jobListLinkEl = fixture.nativeElement.querySelector(
        '#jobListLink'
      ) as HTMLAnchorElement;
      jobListLinkEl.click();
      expect(routerSpy).toHaveBeenCalledOnceWith(['/jobs', 'list']);
    });

    it('should navigate to the edit job page when the Edit button in the page footer is clicked', async () => {
      const routerSpy = spyOn(router, 'navigate');
      const editJobButtonEl = fixture.nativeElement.querySelector('#editBtn') as HTMLButtonElement;
      editJobButtonEl.click();
      expect(routerSpy).toHaveBeenCalledOnceWith(['/jobs', 40, 'edit']);
    });

    xit('should navigate to artist detail when a card is clicked', async () => {
      const routerSpy = spyOn(router, 'navigate');
      const cardEl = fixture.nativeElement.querySelector(
        '.ar-thumbnail-card:first-of-type'
      ) as HTMLDivElement;
      cardEl.click();
      expect(routerSpy).toHaveBeenCalledOnceWith(['/art', 10]);
    });
  });
});
