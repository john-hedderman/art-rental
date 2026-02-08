import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, distinctUntilChanged, map, Observable, Subject, takeUntil } from 'rxjs';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Artist, ITag } from '../../../model/models';
import { Collections } from '../../../shared/enums/collections';
import { OperationsService } from '../../../service/operations-service';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/strings';
import {
  ActionButton,
  ActionLink,
  FooterActions,
  HeaderActions
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
  standalone: true
})
export class ArtistDetail extends DetailBase implements OnInit, OnDestroy {
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

  private readonly destroy$ = new Subject<void>();

  artist: Artist = {} as Artist;
  artistId = 0;
  tags: ITag[] = [];

  deleteStatus = '';

  addTagToArtistStatus = '';
  updateAddedTagStatus = '';

  removeTagFromArtistStatus = '';
  updateRemovedTagStatus = '';

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
      Util.replaceTokens(Msgs.DELETE_FAILED, { entity: 'artist' })
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
      this.artistId
    );
  }

  async addTag(tagId: number) {
    this.addTagToArtistStatus = await this.addTagToArtist(tagId);
    this.updateAddedTagStatus = await this.updateAddedTag(tagId);
    this.messagesService.showStatus(
      this.addTagToArtistStatus,
      Util.replaceTokens(Msgs.SAVED, { entity: 'artist' }),
      Util.replaceTokens(Msgs.SAVE_FAILED, { entity: 'artist' })
    );
    this.messagesService.clearStatus();
    this.dataService.reloadData(['artists', 'tags']);
  }

  async addTagToArtist(tagId: number): Promise<string> {
    let result = Const.SUCCESS;
    const artist = this.artist;
    if (!artist) {
      console.error('Add tag error, could not find the artist to update');
      return Const.FAILURE;
    }
    try {
      artist.tag_ids = [...artist.tag_ids, tagId];
      delete (artist as any)._id;
      const returnData = await this.dataService.saveDocument(
        artist,
        Collections.Artists,
        this.artistId,
        'artist_id'
      );
      if (returnData.modifiedCount === 0) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Update artist error:', error);
      result = Const.FAILURE;
    }
    return result;
  }

  async updateAddedTag(tagId: number): Promise<string> {
    let result = Const.SUCCESS;
    const tag = this.tags.find((tag) => tag.tag_id === tagId);
    if (!tag) {
      console.error('Add tag error, could not find the tag to update');
      return Const.FAILURE;
    }
    try {
      tag.artist_ids = [...tag.artist_ids, this.artistId];
      delete (tag as any)._id;
      const returnData = await this.dataService.saveDocument(
        tag,
        Collections.Tags,
        tagId,
        'tag_id'
      );
      if (returnData.modifiedCount === 0) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Update tag error:', error);
      result = Const.FAILURE;
    }
    return result;
  }

  async removeTag(tagId: number) {
    this.removeTagFromArtistStatus = await this.removeTagFromArtist(tagId);
    this.updateRemovedTagStatus = await this.updateRemovedTag(tagId);
    this.messagesService.showStatus(
      this.removeTagFromArtistStatus,
      Util.replaceTokens(Msgs.SAVED, { entity: 'artist' }),
      Util.replaceTokens(Msgs.SAVE_FAILED, { entity: 'artist' })
    );
    this.messagesService.clearStatus();
    this.dataService.reloadData(['artists', 'tags']);
  }

  async removeTagFromArtist(tagId: number): Promise<string> {
    let result = Const.SUCCESS;
    const artist = this.artist;
    if (!artist) {
      console.error('Remove tag error, could not find the artist to update');
      return Const.FAILURE;
    }
    try {
      artist.tag_ids = artist.tag_ids.filter((tag_id) => tag_id !== tagId);
      delete (artist as any)._id;
      const returnData = await this.dataService.saveDocument(
        artist,
        Collections.Artists,
        this.artistId,
        'artist_id'
      );
      if (returnData.modifiedCount === 0) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Update artist error:', error);
      result = Const.FAILURE;
    }
    return result;
  }

  async updateRemovedTag(tagId: number): Promise<string> {
    let result = Const.SUCCESS;
    const tag = this.tags.find((tag) => tag.tag_id === tagId);
    if (!tag) {
      console.error('Remove tag error, could not find the tag to update');
      return Const.FAILURE;
    }
    try {
      tag.artist_ids = tag.artist_ids.filter((artist_id) => artist_id !== this.artistId);
      delete (tag as any)._id;
      const returnData = await this.dataService.saveDocument(
        tag,
        Collections.Tags,
        tagId,
        'tag_id'
      );
      if (returnData.modifiedCount === 0) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Update tag error:', error);
      result = Const.FAILURE;
    }
    return result;
  }

  getArtistId(): Observable<number> {
    return this.route.paramMap.pipe(map((params) => +params.get('id')!));
  }

  init() {
    this.getCombinedData$().subscribe(({ artistId, artists, tags }) => {
      this.artistId = artistId;
      this.tags = tags;
      const artist = artists.find((artist) => artist.artist_id === artistId);
      if (artist) {
        this.artist = artist;
      }
    });
  }

  getCombinedData$(): Observable<{
    artistId: number;
    artists: Artist[];
    tags: ITag[];
  }> {
    return combineLatest({
      artistId: this.getArtistId(),
      artists: this.dataService.artists$,
      tags: this.dataService.tags$
    }).pipe(takeUntil(this.destroy$), distinctUntilChanged());
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private operationsService: OperationsService,
    private messagesService: MessagesService
  ) {
    super();
  }

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.messagesService.clearStatus();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
