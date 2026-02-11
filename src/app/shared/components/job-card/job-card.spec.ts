import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { JobCard } from './job-card';
import { IArt, IJob } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import * as Const from '../../../constants';

const mockArt = { art_id: 1, job_id: 11, artist_id: 4, title: 'Wonder Art' } as IArt;
const mockJob = { job_id: 11, client_id: 8, site_id: 15, job_number: '000007' } as IJob;
const mockWarehouse = { job_id: 1, job_number: 'No job', art_ids: [1, 2, 3] } as IJob;

const mockDataService = {
  art$: of([mockArt, { art_id: 2, job_id: 12 }, { art_id: 3 }]),
  artists$: of([{ artist_id: 4, name: 'George Clooney', photo_path: '', tag_ids: [] }]),
  clients$: of([{ client_id: 7 }, { client_id: 8, name: 'Amazon' }, { client_id: 9 }]),
  jobs$: of([mockWarehouse, { job_id: 10 }, mockJob, { job_id: 12, client_id: 9, site_id: 13 }]),
  sites$: of([{ site_id: 13 }, { site_id: 14 }, { site_id: 15, name: 'Area 51' }]),
  reloadData: () => {},
  saveDocument: () => Promise.resolve({ modifiedCount: 1 })
};

const artData = { art: mockArt, oldJob: mockWarehouse };
const artDataFromOtherJob = { art: mockArt, oldJob: { job_id: 12, art_ids: undefined } };

function createDragEvent(type: string, data: any) {
  const dataTransfer = new DataTransfer();
  dataTransfer.setData('text/plain', JSON.stringify(data));
  return new DragEvent(type, { dataTransfer: dataTransfer });
}

describe('JobCard', () => {
  let component: JobCard;
  let fixture: ComponentFixture<JobCard>;
  let assignService: any;
  let hostEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobCard],
      providers: [provideHttpClient(), { provide: DataService, useValue: mockDataService }]
    }).compileComponents();

    fixture = TestBed.createComponent(JobCard);
    component = fixture.componentInstance;

    hostEl = fixture.nativeElement as HTMLElement;
    assignService = component['artAssignmentService'];

    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load all data when the component is initialized', fakeAsync(async () => {
      component.job_id = mockJob.job_id;
      component.getFilteredArt$ = () => of([mockArt]);
      mockDataService.jobs$ = of([mockJob]);
      component.init();
      tick(1000);
      fixture.detectChanges();

      expect(component.job?.job_number).toBe('000007');
      component.artwork$?.subscribe((art) => {
        expect(art[0].title).toBe('Wonder Art');
      });
    }));

    it('should set the warehouse card footer content to indicate as much', fakeAsync(() => {
      component.job_id = mockWarehouse.job_id;
      component.getFilteredArt$ = () => of([]);
      mockDataService.jobs$ = of([mockWarehouse]);
      component.init();
      tick(1000);
      fixture.detectChanges();

      expect(component.cardFooterContent).toBe('Warehouse');
    }));
  });

  describe('Drag and drop', () => {
    it('should register drag and drop events', () => {
      const connectDroppableSpy = spyOn(component, 'connectDroppable');
      component.ngAfterViewInit();

      expect(connectDroppableSpy).toHaveBeenCalled();
    });

    it('should allow art to be dragged into a job card', () => {
      const dragEvent = createDragEvent('dragenter', artData);
      const preventDefaultSpy = spyOn(dragEvent, 'preventDefault');
      hostEl.dispatchEvent(dragEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();

      const contentEl = fixture.nativeElement.querySelector('.ar-job-card__content') as HTMLElement;
      expect(contentEl.classList).toContain('droppable');
    });

    it('should allow art to be dragged over a job card', () => {
      const dragEvent = createDragEvent('dragover', artData);
      const preventDefaultSpy = spyOn(dragEvent, 'preventDefault');
      hostEl.dispatchEvent(dragEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should allow art to be dragged out of a job card', () => {
      const dragEvent = createDragEvent('dragleave', artData);
      hostEl.dispatchEvent(dragEvent);

      const contentEl = fixture.nativeElement.querySelector('.ar-job-card__content') as HTMLElement;
      expect(contentEl.classList).not.toContain('droppable');
    });

    it('should allow art to be dropped into a job card', () => {
      component.job = mockJob;
      component.job_id = mockJob.job_id;
      const assignArtSpy = spyOn(component['artAssignmentService'], 'assignArt');

      const dragEvent = createDragEvent('drop', artData);
      hostEl.dispatchEvent(dragEvent);

      const contentEl = fixture.nativeElement.querySelector('.ar-job-card__content') as HTMLElement;
      expect(contentEl.classList).not.toContain('droppable');

      expect(assignArtSpy).toHaveBeenCalled();
    });

    it('should unregister drag and drop events', () => {
      const removeListenersSpy = spyOn(component, 'removeListeners');
      component.ngOnDestroy();

      expect(removeListenersSpy).toHaveBeenCalled();
    });
  });

  describe('Save art assignment', () => {
    const updateArt = (art: IArt, oldJob: IJob, newJob: IJob) => Promise.resolve(Const.SUCCESS);
    const updateOldJob = (art: IArt, newJob: IJob) => Promise.resolve(Const.SUCCESS);
    const updateNewJob = (art: IArt, newJob: IJob) => Promise.resolve(Const.SUCCESS);

    it('should attempt to save an art assignment to the database', fakeAsync(() => {
      component.job = mockJob;
      const saveSpy = spyOn(component['artAssignmentService'], 'save');
      const postSaveSpy = spyOn(component['artAssignmentService'], 'postSave');

      const dragEvent = createDragEvent('drop', artData);
      hostEl.dispatchEvent(dragEvent);

      expect(saveSpy).toHaveBeenCalled();
      tick(1000);
      expect(postSaveSpy).toHaveBeenCalled();
    }));

    describe('Save art', () => {
      beforeEach(() => {
        assignService['dataService'].saveDocument = () => Promise.resolve({ modifiedCount: 1 });
        assignService.updateOldJob = updateOldJob;
        assignService.updateNewJob = updateNewJob;
        component.job = mockJob;
        component.job_id = mockJob.job_id;
      });

      it('should save the art to the database', fakeAsync(() => {
        const dragEvent = createDragEvent('drop', artData);
        hostEl.dispatchEvent(dragEvent);

        tick(1000);
        expect(assignService.saveStatus).toBe(Const.SUCCESS);
      }));

      it('should fail to save the art if nothing was modified in the database', fakeAsync(() => {
        assignService['dataService'].saveDocument = () => Promise.resolve({ modifiedCount: 0 });

        const dragEvent = createDragEvent('drop', artData);
        hostEl.dispatchEvent(dragEvent);

        tick(1000);
        expect(assignService.saveStatus).toBe(Const.FAILURE);
      }));
    });

    describe('Save old job', () => {
      beforeEach(() => {
        assignService['dataService'].saveDocument = () => Promise.resolve({ modifiedCount: 1 });
        assignService.updateArt = updateArt;
        assignService.updateNewJob = updateNewJob;
        component.job = mockJob;
        component.job_id = mockJob.job_id;
      });

      it('should save the old job to the database', fakeAsync(() => {
        const dragEvent = createDragEvent('drop', artData);
        hostEl.dispatchEvent(dragEvent);

        tick(1000);
        expect(assignService.saveStatus).toBe(Const.SUCCESS);
      }));

      it('should fail to save the old job if nothing was modified in the database', fakeAsync(() => {
        assignService['dataService'].saveDocument = () => Promise.resolve({ modifiedCount: 0 });

        const dragEvent = createDragEvent('drop', artData);
        hostEl.dispatchEvent(dragEvent);

        tick(1000);
        expect(assignService.saveStatus).toBe(Const.FAILURE);
      }));
    });

    describe('Save new job', () => {
      beforeEach(() => {
        assignService['dataService'].saveDocument = () => Promise.resolve({ modifiedCount: 1 });
        assignService.updateArt = updateArt;
        assignService.updateOldJob = updateOldJob;
        component.job = mockJob;
        component.job_id = mockJob.job_id;
      });

      it('should save the new job to the database', fakeAsync(() => {
        const dragEvent = createDragEvent('drop', artData);
        hostEl.dispatchEvent(dragEvent);

        tick(1000);
        expect(assignService.saveStatus).toBe(Const.SUCCESS);
      }));

      it('should fail to save the new job if nothing was modified in the database', fakeAsync(() => {
        assignService['dataService'].saveDocument = () => Promise.resolve({ modifiedCount: 0 });

        const dragEvent = createDragEvent('drop', artData);
        hostEl.dispatchEvent(dragEvent);

        tick(1000);
        expect(assignService.saveStatus).toBe(Const.FAILURE);
      }));
    });
  });
});
