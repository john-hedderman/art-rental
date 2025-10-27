import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, map, Observable, take } from 'rxjs';

import { Art, HeaderData } from '../../../model/models';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { DataService } from '../../../service/data-service';
import { Collections } from '../../../shared/enums/collections';

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
    headerButtons: [],
    headerLinks: [
      {
        id: 'goToArtListLink',
        label: 'Art list',
        routerLink: '/art/list',
        linkClass: '',
        clickHandler: this.goToArtList,
      },
    ],
  };

  art: Art = {} as Art;
  artId = 0;

  deleteStatus = '';
  OPERATION_SUCCESS = 'success';
  OPERATION_FAILURE = 'failure';

  async onClickDelete() {
    this.deleteStatus = await this.deleteDocument();
  }

  async deleteDocument(): Promise<string> {
    const collectionName = Collections.Art;
    let result = this.OPERATION_SUCCESS;
    try {
      const returnData = await this.dataService.deleteDocument(
        collectionName,
        this.artId,
        'art_id'
      );
      if (returnData.deletedCount === 0) {
        result = this.OPERATION_FAILURE;
      }
    } catch (error) {
      console.error('Delete error:', error);
      result = this.OPERATION_FAILURE;
    }
    return result;
  }

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
