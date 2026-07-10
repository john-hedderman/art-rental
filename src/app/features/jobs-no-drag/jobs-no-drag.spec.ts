import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsNoDrag } from './jobs-no-drag';

describe('JobsNoDrag', () => {
  let component: JobsNoDrag;
  let fixture: ComponentFixture<JobsNoDrag>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobsNoDrag]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobsNoDrag);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
