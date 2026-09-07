import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { combineLatest, filter, map, Observable, Subject, take } from 'rxjs';
import { Store } from '@ngrx/store';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import {
  ActionButton,
  ActionLink,
  FooterActions,
  HeaderActions
} from '../../../shared/actions/action-data';
import { IArt, IArtist, ITag } from '../../../model/models';
import { Tags } from '../../../shared/components/tags/tags';
import { DetailBase } from '../../../shared/components/base/detail-base/detail-base';
import { ArtThumbnailCard } from '../../../shared/components/art-thumbnail-card/art-thumbnail-card';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { DeleteButton } from '../../../shared/buttons/delete-button';
import { selectArt, selectArtists, selectTags } from '../../../core/+state/core.selectors';
import { selectArtistById } from '../+state/artists-ngrx.selectors';
import { CoreDataActions } from '../../../core/+state/core.actions';
import { ArtistActions } from '../+state/artists-ngrx.actions';
import { TagActions } from '../../admin/tags/+state/tags.actions';

@Component({
  imports: [PageHeader, Tags, AsyncPipe, ArtThumbnailCard, PageFooter],
  selector: 'app-artist-ngrx-detail',
  styleUrl: './artist-ngrx-detail.scss',
  templateUrl: './artist-ngrx-detail.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
export class ArtistNgrxDetail extends DetailBase implements OnInit, OnDestroy {
  router = inject(Router);
  store = inject(Store);
  route = inject(ActivatedRoute);

  goToEditArtist = () => this.router.navigate(['/artists-ngrx', this.artistId, 'edit']);
  goToArtistList = () => this.router.navigate(['/artists-ngrx', 'list']);

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

  artistId = 0;
  artist: IArtist = {} as IArtist;
  tags: ITag[] = [];

  artwork$: Observable<IArt[]>;
  artists$: Observable<IArtist[]>;
  tags$: Observable<ITag[]>;
  artist$: Observable<IArtist>;

  deleteStatus = '';

  destroy$ = new Subject<void>();

  async onClickDelete() {
    this.deleteItem(this.goToArtistList);
  }

  override preDelete(): void {}

  override async delete(): Promise<string> {
    this.deleteArtist();
    // FIXME: dummy return for now - will update all other pages' delete() methods to rely on state.opStatus
    return '';
  }

  override postDelete(): void {}

  deleteArtist() {
    combineLatest({
      artist: this.artist$,
      tags: this.tags$
    })
      .pipe(take(1))
      .subscribe(({ artist, tags }) => {
        const artistItem = { ...artist };
        const tagItems = tags.filter((tag) => tag.artist_ids.includes(artist.artist_id));
        const filteredTags = [];
        for (const tagItem of tagItems) {
          const filteredTag = { ...tagItem };
          filteredTag.artist_ids = filteredTag.artist_ids.filter(
            (artist_id) => artist_id !== artist.artist_id
          );
          filteredTags.push(filteredTag);
        }
        this.store.dispatch(ArtistActions.deleteArtist({ artist: artistItem, tags: filteredTags }));
      });
  }

  async removeTag(tagId: number) {
    combineLatest({
      artist: this.artist$,
      tags: this.tags$
    })
      .pipe(take(1))
      .subscribe(({ artist, tags }) => {
        const artistItem = { ...artist! } as IArtist;
        const tagItem = tags.find((tag) => tag.tag_id === tagId)!;
        if (artistItem?.tag_ids.indexOf(tagId) === -1) {
          return;
        }
        this.store.dispatch(TagActions.removeTagFromArtist({ artist: artistItem, tag: tagItem }));
      });
  }

  async addTag(tagId: number) {
    combineLatest({
      artist: this.artist$,
      tags: this.tags$
    })
      .pipe(take(1))
      .subscribe(({ artist, tags }) => {
        if (artist?.tag_ids.indexOf(tagId) !== -1) {
          return;
        }
        this.artist = artist!;
        this.tags = tags;
        const tag = this.tags.find((tagItem) => tagItem.tag_id === tagId)!;
        this.store.dispatch(
          TagActions.assignTagToArtist({
            artist: this.artist,
            tag
          })
        );
      });
  }

  setArtistId() {
    this.artistId = +(this.route.snapshot.paramMap.get('id') || 0);
  }

  constructor() {
    super();
    this.setArtistId();
    this.artwork$ = this.store
      .select(selectArt)
      .pipe(map((artwork) => artwork.filter((artItem) => artItem.artist_id === this.artistId)));
    this.artists$ = this.store.select(selectArtists);
    this.tags$ = this.store.select(selectTags);
    this.artist$ = this.store.select(selectArtistById(this.artistId));
  }

  ngOnInit(): void {
    this.store.dispatch(CoreDataActions.loadAllData({ refresh: false }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
