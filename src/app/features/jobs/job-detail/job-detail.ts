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
        label: '<i class="bi bi-arrow-left"></i> Back',
        type: 'button',
        buttonClass: 'btn btn-primary btn-sm',
        disabled: false,
        clickHandler: this.navigateToJobList,
      },
    ],
  };

  jobId = '';
  job$: Observable<DetailedJob> | undefined;

  jobs: Job[] = [];
  clients: Client[] = [];

  getJobId(): Observable<string> {
    return this.route.paramMap.pipe(
      map((params) => {
        const id = params.get('id');
        return id !== null ? id : '';
      })
    );
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService
  ) {
    combineLatest([this.dataService.clients$, this.getJobId(), this.dataService.jobs$]).subscribe(
      ([clients, jobId, jobs]) => {
        if (clients && jobId && jobs) {
          this.clients = clients;
          this.jobId = jobId;
          this.jobs = jobs.map((job: Job) => {
            const clients = this.clients.filter((client) => client.id === job.clientId);
            const clientName = clients.length ? clients[0].name : '';
            const mergedJob = { ...job, clientName: clientName };
            if (mergedJob.id === this.jobId) {
              this.job$ = of(mergedJob); // for template
            }
            return mergedJob;
          });
        }
      }
    );
  }
}
