import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, map, Observable, take } from 'rxjs';

import { Art, ButtonbarData, HeaderData } from '../../../model/models';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { DataService } from '../../../service/data-service';
import { Collections } from '../../../shared/enums/collections';
import { Buttonbar } from '../../../shared/components/buttonbar/buttonbar';
import * as Constants from '../../../constants';

@Component({
  selector: 'app-art-detail',
  imports: [PageHeader, RouterLink, Buttonbar],
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

  buttonbarData: ButtonbarData = {
    buttons: [
      {
        id: 'editArtBtn',
        label: 'Edit',
        type: 'button',
        buttonClass: 'btn btn-primary',
        disabled: false,
        dataBsToggle: null,
        dataBsTarget: null,
        clickHandler: this.goToEditArt,
      },
      {
        id: 'deleteArtBtn',
        label: 'Delete',
        type: 'button',
        buttonClass: 'btn btn-danger ms-3',
        disabled: false,
        dataBsToggle: 'modal',
        dataBsTarget: '#confirmModal',
        clickHandler: null,
      },
    ],
  };

  art: Art = {} as Art;
  artId = 0;

  deleteStatus = '';
  readonly OP_SUCCESS = Constants.SUCCESS;
  readonly OP_FAILURE = Constants.FAILURE;

  async onClickDelete() {
    this.deleteStatus = await this.deleteDocument();
    if (this.deleteStatus === Constants.SUCCESS) {
      this.dataService.load('art').subscribe((art) => this.dataService.art$.next(art));
    }
  }

  async deleteDocument(): Promise<string> {
    const collectionName = Collections.Art;
    let result = Constants.SUCCESS;
    try {
      const returnData = await this.dataService.deleteDocument(
        collectionName,
        this.artId,
        'art_id'
      );
      if (returnData.deletedCount === 0) {
        result = Constants.FAILURE;
      }
    } catch (error) {
      console.error('Delete error:', error);
      result = Constants.FAILURE;
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
      artwork: this.dataService.art$,
      artId: this.getArtId(),
      jobs: this.dataService.jobs$,
      clients: this.dataService.clients$,
      artists: this.dataService.artists$,
      sites: this.dataService.sites$,
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
