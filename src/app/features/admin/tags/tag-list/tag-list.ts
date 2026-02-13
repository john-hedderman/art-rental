import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { combineLatest, distinctUntilChanged, Observable, of, Subject, takeUntil } from 'rxjs';

import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { PageFooter } from '../../../../shared/components/page-footer/page-footer';
import { FooterActions, HeaderActions } from '../../../../shared/actions/action-data';
import { DataService } from '../../../../service/data-service';
import { IArt, IArtist, ITag } from '../../../../model/models';
import { OperationsService } from '../../../../service/operations-service';
import { AddButton } from '../../../../shared/buttons/add-button';
import { Collections } from '../../../../shared/enums/collections';
import * as Const from '../../../../constants';
import * as Msgs from '../../../../shared/strings';
import { Util } from '../../../../shared/util/util';
import { MessagesService } from '../../../../service/messages-service';

@Component({
  selector: 'app-tag-list',
  imports: [PageHeader, PageFooter, AsyncPipe],
  templateUrl: './tag-list.html',
  styleUrl: './tag-list.scss',
  standalone: true
})
export class TagList implements OnInit, OnDestroy {
  @ViewChild('tagSearch') tagSearch: ElementRef | undefined;

  goToAddTag = () => this.router.navigate(['/tags', 'add']);

  headerData = new HeaderActions('tag-list', 'Tags', [], []);
  footerData = new FooterActions([]);

  art: IArt[] = [];
  artists: IArtist[] = [];
  detailedTags: ITag[] = [];
  tags: ITag[] = [];
  tags$: Observable<ITag[]> | undefined;

  private readonly destroy$ = new Subject<void>();

  deleteStatus = '';

  modalEl: HTMLDivElement | null = null;

  onFocusTagInput() {
    const tagInSystemEl = document.getElementById('tag-in-system') as HTMLDivElement;
    tagInSystemEl.classList.remove('d-block');
  }

  onClickAdd() {
    const tagSearchEl = this.tagSearch?.nativeElement as HTMLInputElement;
    const tagValue = tagSearchEl.value.toLowerCase().trim();
    tagSearchEl.value = '';
    tagSearchEl.focus();

    const tagInSystemEl = document.getElementById('tag-in-system') as HTMLDivElement;
    if (tagValue !== '' && this.tags?.map((tag) => tag.name)?.includes(tagValue)) {
      tagInSystemEl.classList.add('d-block');
      return;
    }
    tagInSystemEl.classList.remove('d-block');

    this.addTag(tagValue);
  }

  async addTag(name: string) {
    const tagStatus = await this.saveTag(name);
    this.messagesService.showStatus(
      tagStatus,
      Util.replaceTokens(Msgs.SAVED, { entity: 'tag' }),
      Util.replaceTokens(Msgs.SAVE_FAILED, { entity: 'tag' })
    );
    this.messagesService.clearStatus();
    this.dataService.reloadData(['tags']);
  }

  async saveTag(name: string): Promise<string> {
    const tagId = Date.now();
    const data = {
      tag_id: tagId,
      name,
      art_ids: [],
      artist_ids: []
    } as ITag;
    return await this.operationsService.saveDocument(data, Collections.Tags);
  }

  async onClickDelete(event: PointerEvent, tagIsInUse?: boolean) {
    const buttonEl = event.target as HTMLButtonElement;
    const tagId = buttonEl.getAttribute('data-bs-tag-id');
    if (tagId) {
      this.deleteStatus = await this.deleteTag(tagId, tagIsInUse);
      this.messagesService.showStatus(
        this.deleteStatus,
        Util.replaceTokens(Msgs.DELETED, { entity: 'tag' }),
        Util.replaceTokens(Msgs.DELETE_FAILED, { entity: 'tag' })
      );
      this.messagesService.clearStatus();
      this.dataService.reloadData(['art', 'artists', 'tags']);
    }
  }

  async deleteTag(tagId: string, tagIsInUse?: boolean): Promise<string> {
    const tagStatus = await this.operationsService.deleteDocument('tags', 'tag_id', +tagId);
    const artStatus = tagIsInUse ? await this.updateArt(tagId) : Const.SUCCESS;
    const artistsStatus = tagIsInUse ? await this.updateArtists(tagId) : Const.SUCCESS;
    return Util.jobResult([tagStatus, artStatus, artistsStatus]);
  }

  async updateArt(tagId: string): Promise<string> {
    let result = Const.SUCCESS;
    const artwork = this.art.filter((art) => art.tag_ids.includes(+tagId));
    for (const art of artwork) {
      const tag_ids = art.tag_ids.filter((tag_id) => tag_id !== +tagId);
      let newArt: IArt = { ...art, tag_ids };
      try {
        delete (newArt as any)._id;
        const data = await this.dataService.saveDocument(
          newArt,
          Collections.Art,
          newArt.art_id,
          'art_id'
        );
        if (data.modifiedCount === 0) {
          result = Const.FAILURE;
        }
      } catch (error) {
        console.error('Save art error:', error);
        result = Const.FAILURE;
      }
    }
    return result;
  }

  async updateArtists(tagId: string): Promise<string> {
    let result = Const.SUCCESS;
    const artists = this.artists.filter((artist) => artist.tag_ids.includes(+tagId));
    for (const artist of artists) {
      const tag_ids = artist.tag_ids.filter((tag_id) => tag_id !== +tagId);
      let newArtist: IArtist = { ...artist, tag_ids };
      try {
        delete (newArtist as any)._id;
        const data = await this.dataService.saveDocument(
          newArtist,
          Collections.Artists,
          newArtist.artist_id,
          'artist_id'
        );
        if (data.modifiedCount === 0) {
          result = Const.FAILURE;
        }
      } catch (error) {
        console.error('Save art error:', error);
        result = Const.FAILURE;
      }
    }
    return result;
  }

  trackByTagId(tag: any) {
    return tag.tag_id;
  }

  sortByStringField(sortable: any[], field: string) {
    sortable.sort((a: any, b: any) => (a[field] || '').localeCompare(b[field] || ''));
  }

  onShowModal(event: any) {
    this.modalEl = document.getElementById('confirmModal') as HTMLDivElement;
    const deleteTagButtonEl = event.relatedTarget as HTMLButtonElement;
    const tagId = deleteTagButtonEl?.getAttribute('data-bs-tag-id');
    const deleteTagConfirmEl = this.modalEl?.querySelector('#confirmedDeleteBtn');
    deleteTagConfirmEl?.setAttribute('data-bs-tag-id', tagId!);
  }

  initModal() {
    this.modalEl = document.getElementById('confirmModal') as HTMLDivElement;
    if (this.modalEl) {
      // when the modal is shown, get the tag id from the button that opened it
      // add that tag id to the confirm button element, for use by its click handler
      this.modalEl.addEventListener('show.bs.modal', this.onShowModal.bind(this));
    }
  }

  init() {
    this.getCombinedData$().subscribe(({ artwork, producers, tags }) => {
      if (tags && tags.length > 0) {
        const detailedTags = tags
          .map((tag) => {
            const art = artwork.filter((piece) => tag.art_ids.includes(piece.art_id));
            return { ...tag, art };
          })
          .map((tag) => {
            const artists = producers.filter((artist) => tag.artist_ids.includes(artist.artist_id));
            return { ...tag, artists };
          });
        this.detailedTags = [...detailedTags];
        this.sortByStringField(this.detailedTags, 'name');
        this.tags = detailedTags;
        this.tags$ = of(this.detailedTags);
      }
      this.art = artwork;
      this.artists = producers;
    });

    this.initModal();
  }

  getCombinedData$(): Observable<{
    artwork: IArt[];
    producers: IArtist[];
    tags: ITag[];
  }> {
    return combineLatest({
      artwork: this.dataService.art$,
      producers: this.dataService.artists$,
      tags: this.dataService.tags$
    }).pipe(takeUntil(this.destroy$), distinctUntilChanged());
  }

  constructor(
    private dataService: DataService,
    private operationsService: OperationsService,
    private router: Router,
    private messagesService: MessagesService
  ) {}

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.messagesService.clearStatus();
    this.destroy$.next();
    this.destroy$.complete();
    this.modalEl?.removeEventListener('show.bs.modal', this.onShowModal.bind(this));
  }
}
