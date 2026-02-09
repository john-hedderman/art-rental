import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ArtAssignmentService } from './art-assignment-service';
import { provideHttpClient } from '@angular/common/http';
import { IArt, Job } from '../model/models';

const mockArt = { art_id: 1, job_id: 11, artist_id: 4, title: 'Wonder Art' } as IArt;
const mockOldJob = {} as Job;
const mockNewJob = { job_id: 11, client_id: 8, site_id: 15, job_number: '000007' } as Job;

describe('ArtAssignment', () => {
  let service: ArtAssignmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(ArtAssignmentService);
  });

  describe('Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('Art assignment', () => {
    it('should signal that art is being assigned to a job', fakeAsync(() => {
      service.assignArt(mockArt, mockOldJob, mockNewJob);
      tick(1000);

      service.assignedArt$.subscribe((data) => {});
    }));
  });
});
