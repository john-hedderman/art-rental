import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';

import { Client, HeaderButton, Job } from '../../../model/models';
import { PageHeaderService } from '../../../service/page-header-service';
import { DataService } from '../../../service/data-service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-job-detail',
  imports: [AsyncPipe],
  templateUrl: './job-detail.html',
  styleUrl: './job-detail.scss',
  standalone: true,
})
export class JobDetail {
  headerTitle = 'Job detail';
  navigateToJobList = () => {
    this.router.navigate(['/jobs', 'list']);
  };
  headerButtons: HeaderButton[] = [
    {
      id: 'returnToJobListBtn',
      label: '<i class="bi bi-arrow-left"></i> Back',
      type: 'button',
      buttonClass: 'btn btn-primary',
      disabled: false,
      clickHandler: this.navigateToJobList,
    },
  ];

  jobs$: Observable<Job[]>;
  clients$: Observable<Client[]>;
  jobId$: Observable<string>;
  data$: Observable<any[]>;
  job$: Observable<Job> | undefined;

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
    private pageHeaderService: PageHeaderService,
    private route: ActivatedRoute,
    private dataService: DataService
  ) {
    this.jobs$ = this.dataService.load('jobs');
    this.clients$ = this.dataService.load('clients');
    this.jobId$ = this.getJobId();
    this.data$ = combineLatest([this.jobs$, this.clients$, this.jobId$]).pipe(take(1));

    this.data$.subscribe(([jobs, clients, jobId]) => {
      this.clients = clients;
      // for the page header
      let pageHeaderJob: Job = {} as Job;
      // merge client names into job objects, noting the current job
      this.jobs = jobs.map((job: Job) => {
        const matchingClients = this.clients.filter((client) => client.id === job.clientId);
        const clientName = matchingClients.length > 0 ? matchingClients[0].name : '';
        const mergedJob = { ...job, clientName };
        if (mergedJob.id === +jobId) {
          this.job$ = of(mergedJob); // Observable is for page content
          pageHeaderJob = mergedJob;
        }
        return mergedJob;
      });

      this.pageHeaderService.send({
        headerTitle: pageHeaderJob.clientName,
        headerButtons: this.headerButtons,
      });
    });
  }
}
