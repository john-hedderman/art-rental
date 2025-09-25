import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { combineLatest, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { Art, Client, HeaderData, Job } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Card } from '../../../shared/components/card/card';
import { Util } from '../../../shared/util/util';

@Component({
  selector: 'app-job-detail',
  imports: [AsyncPipe, PageHeader, RouterLink, Card],
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

  job$: Observable<Job> | undefined;

  handleArtCardClick = (id: number, event: PointerEvent) => {
    const tgt = event.target as HTMLElement;
    if (tgt.id === 'cardFooter' || tgt.id === 'cardFormCheck' || tgt.id === 'cardCheck') {
      return;
    }
    this.router.navigate(['/art', id]);
  };

  getJobId(): Observable<string> {
    return this.route.paramMap.pipe(map((params) => params.get('id') ?? ''));
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService,
    public util: Util
  ) {
    combineLatest([
      this.dataService.clients$,
      this.dataService.art$,
      this.getJobId(),
      this.dataService.jobs$,
    ]).subscribe(([clients, artwork, jobId, jobs]: [Client[], Art[], string, Job[]]) => {
      const job: Job | undefined = jobs.find((job) => job.id === jobId);
      if (job) {
        const client = clients.find((client) => client.id === job.client.id);
        job.client = client ?? ({} as Client);
        job.art = artwork.filter((piece) => piece.job.id === jobId);
        this.job$ = of(job); // for template
      }
    });
  }
}
