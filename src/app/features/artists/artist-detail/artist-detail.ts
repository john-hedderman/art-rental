import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, map, Observable, take } from 'rxjs';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Artist, ButtonbarData } from '../../../model/models';
import { Buttonbar } from '../../../shared/components/buttonbar/buttonbar';
import { DataService } from '../../../service/data-service';
import { Collections } from '../../../shared/enums/collections';
import { OperationsService } from '../../../service/operations-service';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/messages';
import {
  ActionButton,
  ActionLink,
  FooterActions,
  HeaderActions,
} from '../../../shared/actions/action-data';
import { DeleteButton } from '../../../shared/components/buttons/delete-button/delete-button';

@Component({
  selector: 'app-artist-detail',
  imports: [PageHeader, Buttonbar],
  templateUrl: './artist-detail.html',
  styleUrl: './artist-detail.scss',
  standalone: true,
})
export class ArtistDetail implements OnDestroy {
  goToEditArtist = () => this.router.navigate(['/artists', this.artistId, 'edit']);
  goToArtistList = () => this.router.navigate(['/artists', 'list']);

  artistListLink = new ActionLink(
    'artistListLink',
    'Artists',
    '/artists/list',
    '',
    this.goToArtistList
  );
  headerData = new HeaderActions('artist-detail', 'Artist detail', [], [this.artistListLink.data]);

  editButton = new ActionButton(
    'editBtn',
    'Edit',
    'button',
    'btn btn-primary',
    false,
    null,
    null,
    this.goToEditArtist
  );
  footerData = new FooterActions([this.editButton, new DeleteButton()]);

  artist: Artist = {} as Artist;
  artistId = 0;

  deleteStatus = '';
  readonly OP_SUCCESS = Const.SUCCESS;
  readonly OP_FAILURE = Const.FAILURE;

  reloadFromDb() {
    this.dataService
      .load('artists')
      .subscribe((artists) => this.dataService.artists$.next(artists));
  }

  showOpStatus(status: string, success: string, failure: string, delay?: number) {
    this.operationsService.setStatus({ status, success, failure }, delay);
  }

  resetOpStatus(status: string, desiredDelay?: number) {
    const delay = status === Const.SUCCESS ? desiredDelay : Const.CLEAR_ERROR_DELAY;
    this.showOpStatus('', '', '', delay);
  }

  async onClickDelete() {
    this.deleteStatus = await this.operationsService.deleteDocument(
      Collections.Artists,
      'artist_id',
      this.artistId
    );
    this.showOpStatus(this.deleteStatus, Msgs.DELETED_ARTIST, Msgs.DELETE_ARTIST_FAILED);
    this.resetOpStatus(this.deleteStatus, Const.STD_DELAY);
    if (this.deleteStatus === Const.SUCCESS) {
      this.reloadFromDb();
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
    this.resetOpStatus('');
  }
}
