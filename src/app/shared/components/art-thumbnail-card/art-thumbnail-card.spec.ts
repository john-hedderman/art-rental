import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ArtThumbnailCard } from './art-thumbnail-card';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { DataService } from '../../../service/data-service';

const mockDataService = {
  art$: of([
    { art_id: 1, job_id: 11, artist_id: 4, title: 'Wonder Art' },
    { art_id: 2, job_id: 12 },
    { art_id: 3 },
  ]),
  artists$: of([{ artist_id: 4, name: 'Jimmy Page' }]),
  jobs$: of([
    { job_id: 10 },
    { job_id: 11, client_id: 8, site_id: 15, job_number: '000007' },
    { job_id: 12, client_id: 9, site_id: 13 },
  ]),
};

describe('ThumbnailCard', () => {
  let component: ArtThumbnailCard;
  let fixture: ComponentFixture<ArtThumbnailCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtThumbnailCard],
      providers: [provideHttpClient(), { provide: DataService, useValue: mockDataService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtThumbnailCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load all data when the component is initialized', fakeAsync(async () => {
      component.art_id = 1;
      component.job_id = 11;
      component.init();
      tick(1000);
      fixture.detectChanges();

      expect(component.art?.title).toBe('Wonder Art');
      expect(component.art?.artist?.name).toBe('Jimmy Page');
      expect(component.job?.job_number).toBe('000007');
    }));
  });

  describe('Drag and drop', () => {
    function createDragEvent(type: string) {
      const dataTransfer = new DataTransfer();
      return new DragEvent(type, { dataTransfer: dataTransfer });
    }

    beforeEach(() => {
      component.draggable = true;
    });

    it('should register drag events', () => {
      const connectDroppableSpy = spyOn(component, 'connectDrag');
      component.ngAfterViewInit();

      expect(connectDroppableSpy).toHaveBeenCalled();
    });

    it('should allow art to be dragged', fakeAsync(() => {
      component.art_id = 1;
      component.job_id = 11;
      component.init();
      tick(1000);
      fixture.detectChanges();

      const dragEvent = createDragEvent('dragstart');
      const setDataSpy = spyOn(dragEvent.dataTransfer!, 'setData');
      const hostEl = fixture.nativeElement as HTMLElement;
      hostEl.dispatchEvent(dragEvent);

      expect(setDataSpy).toHaveBeenCalled();
    }));

    it('should unregister drag and drop events', () => {
      const removeListenersSpy = spyOn(component, 'removeListeners');
      component.ngOnDestroy();

      expect(removeListenersSpy).toHaveBeenCalled();
    });
  });
});
