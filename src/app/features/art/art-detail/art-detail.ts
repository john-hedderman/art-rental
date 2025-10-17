import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, map, Observable, take } from 'rxjs';

import { Art, HeaderData } from '../../../model/models';
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

  getArtId(): Observable<number> {
    return this.route.paramMap.pipe(map((params) => +params.get('id')!));
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService
  ) {
    combineLatest({
      artwork: this.dataService.art$,
      artId: this.getArtId(),
      jobs: this.dataService.jobs_test$,
      clients: this.dataService.clients$,
      artists: this.dataService.artists$,
    })
      .pipe(take(1))
      .subscribe(({ artwork, artId, jobs, clients, artists }) => {
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
          let artist = artists.find((artist) => artist.artist_id === art?.artist_id);
          if (artist) {
            art = { ...art, artist };
          }
        }
        this.art = art!;
      });
  }
}
