import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, map, Observable, take } from 'rxjs';

import { Art, Client, HeaderData, Job } from '../../../model/models';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { DataService } from '../../../service/data-service';

@Component({
  selector: 'app-art-detail',
  imports: [PageHeader, RouterLink],
  templateUrl: './art-detail.html',
  styleUrl: './art-detail.scss',
  standalone: true,
})
export class ArtDetail {
  art: Art = {} as Art;

  navigateToArtList = () => {
    this.router.navigate(['/art', 'list']);
  };
  headerData: HeaderData = {
    headerTitle: 'Art detail',
    headerButtons: [
      {
        id: 'goToArtListBtn',
        label: 'Art list',
        type: 'button',
        buttonClass: 'btn btn-primary btn-sm',
        disabled: false,
        clickHandler: this.navigateToArtList,
      },
    ],
  };

  getArtId(): Observable<string> {
    return this.route.paramMap.pipe(map((params) => params.get('id') ?? ''));
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService
  ) {
    combineLatest({
      artwork: this.dataService.art$,
      artId: this.getArtId(),
      jobs: this.dataService.jobs$,
      clients: this.dataService.clients$,
    })
      .pipe(take(1))
      .subscribe(({ artwork, artId, jobs, clients }) => {
        let art: Art | undefined = artwork.find((work) => work.id === +artId);
        if (art) {
          let job: Job | undefined = jobs.find((job) => job.id === art?.job?.id);
          if (job) {
            const client: Client | undefined = clients.find(
              (client) => client.id === job?.client?.id
            );
            if (client) {
              job = { ...job, client };
            }
            art = { ...art, job };
          }
        }
        this.art = art!;
      });
  }
}
