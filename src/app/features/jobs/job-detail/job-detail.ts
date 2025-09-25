import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { Client, DetailedJob, HeaderData, Job } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { AsyncPipe } from '@angular/common';
import { PageHeader } from '../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-job-detail',
  imports: [AsyncPipe, PageHeader, RouterLink],
  templateUrl: './job-detail.html',
  styleUrl: './job-detail.scss',
  standalone: true,
})
export class JobDetail {
  navigateToJobList = () => {
    this.router.navigate(['/jobs', 'list']);
  };
  headerData: HeaderData = {
    headerTitle: 'Job detail',
    headerButtons: [
      {
        id: 'returnToJobListBtn',
        label: '<i class="bi bi-arrow-left"></i> Job list',
        type: 'button',
        buttonClass: 'btn btn-primary btn-sm',
        disabled: false,
        clickHandler: this.navigateToJobList,
      },
    ],
  };

  job$: Observable<DetailedJob> | undefined;

  getJobId(): Observable<string> {
    return this.route.paramMap.pipe(map((params) => params.get('id') ?? ''));
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService
  ) {
    combineLatest([this.dataService.clients$, this.getJobId(), this.dataService.jobs$]).subscribe(
      ([clients, jobId, jobs]: [Client[], string, Job[]]) => {
        if (clients && jobId && jobs) {
          const job: Job | undefined = jobs.find((job) => job.id === jobId);
          if (job) {
            const client = clients.find((client) => client.id === job.clientId);
            const clientName = client?.name ?? '';
            const mergedJob = { ...job, clientName };
            this.job$ = of(mergedJob); // for template
          }
        }
      }
    );
  }
}
