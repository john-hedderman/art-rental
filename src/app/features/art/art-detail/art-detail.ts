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
  goToEditArt = () => {
    this.router.navigate(['/art', this.artId, 'edit']);
  };
  goToArtList = () => {
    this.router.navigate(['/art', 'list']);
  };
  headerData: HeaderData = {
    headerTitle: 'Art detail',
    headerButtons: [
      {
        id: 'goToEditArtBtn',
        label: 'Edit',
        type: 'button',
        buttonClass: 'btn btn-primary btn-sm',
        disabled: false,
        clickHandler: this.goToEditArt,
      },
      {
        id: 'goToArtListBtn',
        label: 'Art list',
        type: 'button',
        buttonClass: 'btn btn-primary btn-sm',
        disabled: false,
        clickHandler: this.goToArtList,
      },
    ],
    headerLinks: [],
  };

  art: Art = {} as Art;
  artId = 0;

  getArtId(): Observable<number> {
    return this.route.paramMap.pipe(map((params) => +params.get('id')!));
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService
  ) {
    combineLatest({
      artwork: this.dataService.load('art'),
      artId: this.getArtId(),
      jobs: this.dataService.load('jobs'),
      clients: this.dataService.load('clients'),
      artists: this.dataService.load('artists'),
      sites: this.dataService.load('sites'),
    })
      .pipe(take(1))
      .subscribe(({ artwork, artId, jobs, clients, artists, sites }) => {
        this.artId = artId;
        let art = artwork.find((piece) => piece.art_id === artId);
        if (art) {
          let job = jobs.find((job) => job.job_id === art?.job_id);
          if (job) {
            const client = clients.find((client) => client.client_id === job?.client_id);
            if (client) {
              job = { ...job, client };
            }
            const site = sites.find((site) => site.job_id === job?.job_id);
            if (site) {
              job = { ...job, site };
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
