import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsNoDragList } from './jobs-no-drag-list';

describe('JobsNoDragList', () => {
  let component: JobsNoDragList;
  let fixture: ComponentFixture<JobsNoDragList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobsNoDragList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobsNoDragList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
