import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { combineLatest, map, Observable, Subject, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';

import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { FooterActions, HeaderActions } from '../../../../shared/actions/action-data';
import { IArt, IArtist, ITag } from '../../../../model/models';
import { DataService } from '../../../../service/data-service';
import { Collections } from '../../../../shared/enums/collections';
import { OperationsService } from '../../../../service/operations-service';
import { selectArt, selectArtists, selectTags } from '../../../../core/+state/core.selectors';
import { TagPill } from '../../../../shared/components/tag-pill/tag-pill';
import * as Const from '../../../../constants';
import { Util } from '../../../../shared/util/util';
import { PageFooter } from '../../../../shared/components/page-footer/page-footer';
import { CoreDataActions } from '../../../../core/+state/core.actions';
import { TagsNgrxActions } from '../+state/tags-ngrx.actions';
import { selectTagById } from '../+state/tags-ngrx.selectors';

@Component({
  imports: [PageHeader, AsyncPipe, TagPill, PageFooter],
  selector: 'app-tags-ngrx-list',
  styleUrl: './tags-ngrx-list.scss',
  templateUrl: './tags-ngrx-list.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
export class TagsNgrxList implements OnInit, OnDestroy {
  @ViewChild('tagSearch') tagSearch: ElementRef | undefined;

  private store = inject(Store);
  private dataService = inject(DataService);
  private operationsService = inject(OperationsService);

  headerData = new HeaderActions('tag-list', 'Tags', [], []);
  footerData = new FooterActions([]);

  art: IArt[] = [];
  artists: IArtist[] = [];
  tags: ITag[] = [];

  tags$: Observable<ITag[]>;

  deleteStatus = '';

  modalEl: HTMLDivElement | null = null;

  destroy$ = new Subject<void>();

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
    const tag = {
      tag_id: Date.now(),
      name,
      art_ids: [],
      artist_ids: []
    } as ITag;
    this.store.dispatch(TagsNgrxActions.addTag({ tag }));
  }

  async onClickDelete(event: any, tagIsInUse?: boolean) {
    let tagId;
    if (event instanceof Event) {
      const buttonEl = event.target as HTMLButtonElement;
      tagId = buttonEl.getAttribute('data-bs-tag-id');
    } else {
      tagId = event.toString();
    }
    if (tagId) {
      const tag$ = this.store.select(selectTagById(+tagId));
      tag$.pipe(take(1)).subscribe((tag) => {
        this.store.dispatch(TagsNgrxActions.deleteTag({ tag }));
      });
    }
  }

  initModal() {
    this.modalEl = document.getElementById('confirmModal') as HTMLDivElement;
    if (this.modalEl) {
      // when the modal is shown, get the tag id from the button that opened it
      // add that tag id to the confirm button element, for use by its click handler
      this.modalEl.addEventListener('show.bs.modal', this.onShowModal.bind(this));
    }
  }

  onShowModal(event: any) {
    this.modalEl = document.getElementById('confirmModal') as HTMLDivElement;
    const deleteTagButtonEl = event.relatedTarget as HTMLButtonElement;
    const tagId = deleteTagButtonEl?.getAttribute('data-bs-tag-id');
    const deleteTagConfirmEl = this.modalEl?.querySelector('#confirmedDeleteBtn');
    deleteTagConfirmEl?.setAttribute('data-bs-tag-id', tagId!);
  }

  sortByStringField(sortable: any[], field: string) {
    sortable.sort((a: any, b: any) => (a[field] || '').localeCompare(b[field] || ''));
  }

  init() {
    combineLatest({
      art: this.store.select(selectArt),
      artists: this.store.select(selectArtists),
      tags: this.store.select(selectTags)
    })
      .pipe(take(1))
      .subscribe(({ art, artists, tags }) => {
        this.tags = tags;
      });

    this.initModal();
  }

  constructor() {
    this.tags$ = this.store
      .select(selectTags)
      .pipe(map((items) => [...items].sort((a, b) => a.name.localeCompare(b.name))));
  }

  ngOnInit(): void {
    this.init();
    this.store.dispatch(CoreDataActions.loadAllData({ refresh: false }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.modalEl?.removeEventListener('show.bs.modal', this.onShowModal.bind(this));
  }
}
