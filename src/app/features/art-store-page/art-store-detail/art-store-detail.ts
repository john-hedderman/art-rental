import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { combineLatest, Observable, Subject, take } from 'rxjs';
import { Store } from '@ngrx/store';

import {
  ActionButton,
  ActionLink,
  FooterActions,
  HeaderActions
} from '../../../shared/actions/action-data';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { IArt, ITag } from '../../../model/models';
import { selectArtById } from '../../art-store-page/+state/art-store.selectors';
import * as Const from '../../../constants';
import { Tags } from '../../../shared/components/tags/tags';
import { DeleteButton } from '../../../shared/buttons/delete-button';
import { DetailBase } from '../../../shared/components/base/detail-base/detail-base';
import { selectArt, selectJobs, selectTags } from '../../../core/+state/core.selectors';
import { CoreDataActions } from '../../../core/+state/core.actions';
import { ArtActions } from '../+state/art-store.actions';
import { TagsNgrxActions } from '../../admin/tags-ngrx/+state/tags-ngrx.actions';

@Component({
  selector: 'app-art-store-detail',
  imports: [PageHeader, AsyncPipe, RouterLink, Tags, PageFooter],
  templateUrl: './art-store-detail.html',
  styleUrl: './art-store-detail.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
export class ArtStoreDetail extends DetailBase implements OnInit, OnDestroy {
  goToEditArt = () => this.router.navigate(['/art-store', this.artId, 'edit']);
  goToArtList = () => this.router.navigate(['/art-store', 'list']);

  artListLink = new ActionLink('artListLink', 'Art', '/art-store/list', '', this.goToArtList);
  headerData = new HeaderActions('art-detail', 'Art detail', [], [this.artListLink.data]);

  artId = 0;

  art$: Observable<IArt[]>;
  tags$: Observable<ITag[]>;
  artItem$: Observable<IArt | undefined>;

  art: IArt = {} as IArt;
  tags: ITag[] = [];

  WAREHOUSE_JOB_NUMBER = Const.WAREHOUSE_JOB_NUMBER;
  SITE_TBD_ID = Const.SITE_TBD_ID;
  OP_SUCCESS = Const.SUCCESS;
  OP_FAILURE = Const.FAILURE;

  editButton = new ActionButton(
    'editBtn',
    'Edit',
    'button',
    'btn btn-primary',
    false,
    null,
    null,
    this.goToEditArt
  );
  footerData = new FooterActions([this.editButton, new DeleteButton()]);

  deleteStatus = '';

  private readonly destroy$ = new Subject<void>();

  override preDelete(): void {}

  override async delete(): Promise<string> {
    this.deleteArt();
    // FIXME: dummy return for now - will update all other pages' delete() methods to rely on state.opStatus
    return '';
  }

  override postDelete(): void {}

  deleteArt() {
    combineLatest({
      artItem: this.store.select(selectArtById(this.artId)),
      jobs: this.store.select(selectJobs)
    })
      .pipe(take(1))
      .subscribe(({ artItem, jobs }) => {
        const jobItem = jobs.find((job) => job.job_id === artItem.job_id);
        if (jobItem) {
          const jobWithoutArt = {
            ...jobItem,
            art_ids: jobItem.art_ids.filter((art_id) => art_id !== artItem.art_id)
          };
          delete (jobWithoutArt as any)._id;
          this.store.dispatch(
            ArtActions.deleteArt({
              art: artItem,
              job: jobWithoutArt,
              artId: artItem.art_id
            })
          );
        }
      });
  }

  async removeTag(tagId: number) {
    combineLatest({
      art: this.artItem$,
      tags: this.tags$
    })
      .pipe(take(1))
      .subscribe(({ art, tags }) => {
        const artItem = { ...art! } as IArt;
        const tagItem = tags.find((tag) => tag.tag_id === tagId)!;
        if (art?.tag_ids.indexOf(tagId) === -1) {
          return;
        }
        this.store.dispatch(TagsNgrxActions.removeTagFromArt({ art: artItem, tag: tagItem }));
      });
  }

  async addTag(tagId: number) {
    combineLatest({
      art: this.artItem$,
      tags: this.tags$
    })
      .pipe(take(1))
      .subscribe(({ art, tags }) => {
        if (art?.tag_ids.indexOf(tagId) !== -1) {
          return;
        }
        this.art = art!;
        this.tags = tags;
        const tag = this.tags.find((tagItem) => tagItem.tag_id === tagId)!;
        this.store.dispatch(
          TagsNgrxActions.assignTagToArt({
            art: this.art,
            tag
          })
        );
      });
  }

  async onClickDelete() {
    this.deleteItem(this.goToArtList);
  }

  setArtId() {
    this.artId = +(this.route.snapshot.paramMap.get('id') || 0);
  }

  constructor(
    private router: Router,
    private store: Store,
    private route: ActivatedRoute
  ) {
    super();
    this.setArtId();
    this.art$ = this.store.select(selectArt);
    this.artItem$ = this.store.select(selectArtById(this.artId));
    this.tags$ = this.store.select(selectTags);
  }

  ngOnInit(): void {
    this.store.dispatch(CoreDataActions.loadAllData({ refresh: false }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
