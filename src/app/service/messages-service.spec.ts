import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { MessagesService } from './messages-service';

describe('MessagesService', () => {
  let service: MessagesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(MessagesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
