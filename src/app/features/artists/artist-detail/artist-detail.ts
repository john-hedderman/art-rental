import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, map, Observable, take } from 'rxjs';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Artist, ButtonbarData, HeaderData } from '../../../model/models';
import { Buttonbar } from '../../../shared/components/buttonbar/buttonbar';
import { DataService } from '../../../service/data-service';
import { Collections } from '../../../shared/enums/collections';
import { OperationsService } from '../../../service/operations-service';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/messages';

@Component({
  selector: 'app-artist-detail',
  imports: [PageHeader, Buttonbar],
  templateUrl: './artist-detail.html',
  styleUrl: './artist-detail.scss',
  standalone: true,
})
export class ArtistDetail implements OnDestroy {
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
        label: 'Artists list',
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
  readonly OP_SUCCESS = Const.SUCCESS;
  readonly OP_FAILURE = Const.FAILURE;

  signalStatus(status: string, success: string, failure: string, delay?: number) {
    this.operationsService.setStatus({ status, success, failure }, delay);
  }

  signalArtistStatus() {
    this.signalStatus(this.deleteStatus, Msgs.DELETED_ARTIST, Msgs.DELETE_ARTIST_FAILED);
  }

  signalResetStatus(delay?: number) {
    if (this.deleteStatus === Const.SUCCESS) {
      this.signalStatus('', '', '', delay);
    }
  }

  async onClickDelete() {
    this.deleteStatus = await this.operationsService.deleteDocument(
      Collections.Artists,
      'artist_id',
      this.artistId
    );
    this.signalArtistStatus();
    this.signalResetStatus(1500);
    if (this.deleteStatus === Const.SUCCESS) {
      this.dataService
        .load('artists')
        .subscribe((artists) => this.dataService.artists$.next(artists));
    }
  }

  getArtistId(): Observable<number> {
    return this.route.paramMap.pipe(map((params) => +params.get('id')!));
  }

  constructor(
    private router: Router,
    private dataService: DataService,
    private route: ActivatedRoute,
    private operationsService: OperationsService
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

  ngOnDestroy(): void {
    this.signalResetStatus(1500);
  }
}
