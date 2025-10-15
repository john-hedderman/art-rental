import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, map, Observable, take } from 'rxjs';

import { ArtTest, HeaderData } from '../../../model/models';
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
  art: ArtTest = {} as ArtTest;

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

  getArtId(): Observable<number> {
    return this.route.paramMap.pipe(map((params) => +params.get('id')!));
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService
  ) {
    combineLatest({
      artwork: this.dataService.art_test$,
      artId: this.getArtId(),
      jobs: this.dataService.jobs_test$,
      clients: this.dataService.clients_test$,
    })
      .pipe(take(1))
      .subscribe(({ artwork, artId, jobs, clients }) => {
        let art = artwork.find((piece) => piece.art_id === artId);
        if (art) {
          let job = jobs.find((job) => job.job_id === art?.job_id);
          if (job) {
            const client = clients.find((client) => client.client_id === job?.client_id);
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
