import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, map, Observable, take } from 'rxjs';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Artist, ButtonbarData, HeaderData } from '../../../model/models';
import { Buttonbar } from '../../../shared/components/buttonbar/buttonbar';
import { OPERATION_SUCCESS, OPERATION_FAILURE } from '../../../shared/constants';
import { DataService } from '../../../service/data-service';
import { Collections } from '../../../shared/enums/collections';

@Component({
  selector: 'app-artist-detail',
  imports: [PageHeader, Buttonbar],
  templateUrl: './artist-detail.html',
  styleUrl: './artist-detail.scss',
  standalone: true,
})
export class ArtistDetail {
  goToEditArtist = () => {
    this.router.navigate(['/artists', this.artistId, 'edit']);
  };
  goToArtistList = () => {
    this.router.navigate(['/artists', 'list']);
  };
  headerData: HeaderData = {
    headerTitle: 'Artist detail',
    headerButtons: [],
    headerLinks: [
      {
        id: 'goToArtistListLink',
        label: 'Artists',
        routerLink: '/art/list',
        linkClass: '',
        clickHandler: this.goToArtistList,
      },
    ],
  };

  buttonbarData: ButtonbarData = {
    buttons: [
      {
        id: 'editArtistBtn',
        label: 'Edit',
        type: 'button',
        buttonClass: 'btn btn-primary',
        disabled: false,
        dataBsToggle: null,
        dataBsTarget: null,
        clickHandler: this.goToEditArtist,
      },
      {
        id: 'deleteArtistBtn',
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

  artist: Artist = {} as Artist;
  artistId = 0;

  deleteStatus = '';
  readonly OP_SUCCESS = OPERATION_SUCCESS;
  readonly OP_FAILURE = OPERATION_FAILURE;

  async onClickDelete() {
    this.deleteStatus = await this.deleteDocument();
    if (this.deleteStatus === OPERATION_SUCCESS) {
      this.dataService
        .load('artists')
        .subscribe((artists) => this.dataService.artists$.next(artists));
    }
  }

  async deleteDocument(): Promise<string> {
    const collectionName = Collections.Artists;
    let result = OPERATION_SUCCESS;
    try {
      const returnData = await this.dataService.deleteDocument(
        collectionName,
        this.artistId,
        'artist_id'
      );
      if (returnData.deletedCount === 0) {
        result = OPERATION_FAILURE;
      }
    } catch (error) {
      console.error('Delete error:', error);
      result = OPERATION_FAILURE;
    }
    return result;
  }

  getArtistId(): Observable<number> {
    return this.route.paramMap.pipe(map((params) => +params.get('id')!));
  }

  constructor(
    private router: Router,
    private dataService: DataService,
    private route: ActivatedRoute
  ) {
    combineLatest({
      artists: this.dataService.artists$,
      artistId: this.getArtistId(),
    })
      .pipe(take(1))
      .subscribe(({ artists, artistId }) => {
        this.artistId = artistId;
        let artist = artists.find((artist) => artist.artist_id === artistId);
        if (artist) {
          this.artist = artist;
        }
      });
  }
}
