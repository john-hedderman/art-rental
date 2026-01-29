import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, map, Observable, take } from 'rxjs';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Artist } from '../../../model/models';
import { Collections } from '../../../shared/enums/collections';
import { OperationsService } from '../../../service/operations-service';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/strings';
import {
  ActionButton,
  ActionLink,
  FooterActions,
  HeaderActions,
} from '../../../shared/actions/action-data';
import { DeleteButton } from '../../../shared/buttons/delete-button';
import { MessagesService } from '../../../service/messages-service';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { Util } from '../../../shared/util/util';
import { DetailBase } from '../../../shared/components/base/detail-base/detail-base';
import { Tags } from '../../../shared/components/tags/tags';

@Component({
  selector: 'app-artist-detail',
  imports: [PageHeader, PageFooter, Tags],
  providers: [MessagesService],
  templateUrl: './artist-detail.html',
  styleUrl: './artist-detail.scss',
  standalone: true,
})
export class ArtistDetail extends DetailBase implements OnInit, OnDestroy {
  goToEditArtist = () => this.router.navigate(['/artists', this.artistId, 'edit']);
  goToArtistList = () => this.router.navigate(['/artists', 'list']);

  artistListLink = new ActionLink(
    'artistListLink',
    'Artists',
    '/artists/list',
    '',
    this.goToArtistList,
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
    this.goToEditArtist,
  );
  footerData = new FooterActions([this.editButton, new DeleteButton()]);

  artist: Artist = {} as Artist;
  artistId = 0;

  deleteStatus = '';

  readonly OP_SUCCESS = Const.SUCCESS;
  readonly OP_FAILURE = Const.FAILURE;

  override preDelete(): void {}

  override async delete(): Promise<string> {
    const deleteStatus = await this.deleteArtist();
    return this.jobResult([deleteStatus]);
  }

  override postDelete(): void {
    this.messagesService.showStatus(
      this.deleteStatus,
      Util.replaceTokens(Msgs.DELETED, { entity: 'artist' }),
      Util.replaceTokens(Msgs.DELETE_FAILED, { entity: 'artist' }),
    );
    this.messagesService.clearStatus();
  }

  async onClickDelete() {
    this.deleteAndReload(['artists'], this.goToArtistList);
  }

  async deleteArtist(): Promise<string> {
    return await this.operationsService.deleteDocument(
      Collections.Artists,
      'artist_id',
      this.artistId,
    );
  }

  getArtistId(): Observable<number> {
    return this.route.paramMap.pipe(map((params) => +params.get('id')!));
  }

  init() {
    this.getCombinedData$().subscribe(({ artistId, artists }) => {
      this.artistId = artistId;
      const artist = artists.find((artist) => artist.artist_id === artistId);
      if (artist) {
        this.artist = artist;
      }
    });
  }

  getCombinedData$(): Observable<{
    artistId: number;
    artists: Artist[];
  }> {
    return combineLatest({
      artistId: this.getArtistId(),
      artists: this.dataService.artists$,
    }).pipe(take(1));
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private operationsService: OperationsService,
    private messagesService: MessagesService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.messagesService.clearStatus();
  }
}
