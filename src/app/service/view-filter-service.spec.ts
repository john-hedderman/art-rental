import { TestBed } from '@angular/core/testing';

import { ViewFilterService } from './view-filter-service';

describe('ViewFilterService', () => {
  let service: ViewFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViewFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
