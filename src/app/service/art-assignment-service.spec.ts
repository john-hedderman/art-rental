import { TestBed } from '@angular/core/testing';

import { ArtAssignment } from './art-assignment-service';

describe('ArtAssignment', () => {
  let service: ArtAssignment;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArtAssignment);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
