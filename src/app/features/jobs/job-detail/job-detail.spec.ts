import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobDetail } from './job-detail';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

describe('JobDetail', () => {
  let component: JobDetail;
  let fixture: ComponentFixture<JobDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobDetail],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(JobDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
