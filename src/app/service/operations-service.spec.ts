import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { OperationsService } from './operations-service';

describe('OperationsService', () => {
  let service: OperationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(OperationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
