import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { combineLatest, Observable, Subject, take, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';

import {
  ActionButton,
  ActionLink,
  FooterActions,
  HeaderActions
} from '../../../shared/actions/action-data';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { IArt, IJob, ITag } from '../../../model/models';
import { selectArtById } from './+state/art-store-detail.selectors';
import * as Const from '../../../constants';
import { Tags } from '../../../shared/components/tags/tags';
import { DeleteButton } from '../../../shared/buttons/delete-button';
import { MessagesService } from '../../../service/messages-service';
import { Util } from '../../../shared/util/util';
import * as Msgs from '../../../shared/strings';
import { DetailBase } from '../../../shared/components/base/detail-base/detail-base';
import { Collections } from '../../../shared/enums/collections';
import { selectArt, selectJobs, selectOpStatus } from '../../../core/+state/core.selectors';
import { ArtActions, CoreDataActions } from '../../../core/+state/core.actions';

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
  jobs$: Observable<IJob[] | undefined>;
  artItem$: Observable<IArt | undefined>;

  art: IArt = {} as IArt;
  jobs: IJob[] = [];
  tags: ITag[] = [];

  WAREHOUSE_JOB_NUMBER = Const.WAREHOUSE_JOB_NUMBER;
  SITE_TBD_ID = Const.SITE_TBD_ID;
  readonly OP_SUCCESS = Const.SUCCESS;
  readonly OP_FAILURE = Const.FAILURE;

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

  removeTagFromArtStatus = '';
  updateRemovedTagStatus = '';

  addTagToArtStatus = '';
  updateAddedTagStatus = '';

  deleteStatus = '';

  private readonly destroy$ = new Subject<void>();

  opStatus$: Observable<string | null>;

  opResult = '';

  override preDelete(): void {}

  override async delete(): Promise<string> {
    this.deleteArt();
    // FIXME: dummy return for now - will update all other pages' delete() methods to be similar, relying on state.opStatus
    return 'DELETED!';
  }

  override postDelete(): void {
    this.messagesService.showStatus(
      this.deleteStatus,
      Util.replaceTokens(Msgs.DELETED, { entity: 'art' }),
      Util.replaceTokens(Msgs.DELETE_FAILED, { entity: 'art' })
    );
    this.messagesService.clearStatus();
  }

  deleteArt() {
    combineLatest({
      artItem: this.store.select(selectArtById(this.artId)),
      jobs: this.store.select(selectJobs)
    })
      .pipe(take(1))
      .subscribe(({ artItem, jobs }) => {
        const jobItem = jobs.find((job) => job.job_id === artItem.job_id);
        if (jobItem) {
          const artIdsWithoutArt = [
            ...jobItem.art_ids?.filter((art_id) => art_id !== artItem.art_id)
          ];
          const jobWithoutArt = { ...jobItem, art_ids: [...artIdsWithoutArt] };
          delete (jobWithoutArt as any)._id;
          const jobItem2 = {
            ...jobItem,
            art_ids: jobItem.art_ids.filter((art_id) => art_id !== artItem.art_id)
          };
          this.store.dispatch(
            ArtActions.deleteArtItem({
              art: artItem,
              job: jobWithoutArt,
              artId: artItem.art_id
            })
          );
        }
      });
  }

  async removeTag(tagId: number) {
    this.removeTagFromArtStatus = await this.removeTagFromArt(tagId);
    this.updateRemovedTagStatus = await this.updateRemovedTag(tagId);
    this.messagesService.showStatus(
      this.removeTagFromArtStatus,
      Util.replaceTokens(Msgs.SAVED, { entity: 'art' }),
      Util.replaceTokens(Msgs.SAVE_FAILED, { entity: 'art' })
    );
    this.messagesService.clearStatus();
    this.dataService.reloadData(['art', 'tags']);
  }

  async addTag(tagId: number) {
    this.addTagToArtStatus = await this.addTagToArt(tagId);
    this.updateAddedTagStatus = await this.updateAddedTag(tagId);
    this.messagesService.showStatus(
      this.addTagToArtStatus,
      Util.replaceTokens(Msgs.SAVED, { entity: 'art' }),
      Util.replaceTokens(Msgs.SAVE_FAILED, { entity: 'art' })
    );
    this.messagesService.clearStatus();
    this.dataService.reloadData(['art', 'tags']);
  }

  async onClickDelete() {
    this.deleteItem(this.goToArtList);
  }

  async removeTagFromArt(tagId: number): Promise<string> {
    let result = Const.SUCCESS;
    const art = this.art;
    if (!art) {
      console.error('Remove tag error, could not find the art to update');
      return Const.FAILURE;
    }
    try {
      art.tag_ids = art.tag_ids.filter((tag_id) => tag_id !== tagId);
      delete (art as any)._id;
      const returnData = await this.dataService.saveDocument(
        art,
        Collections.Art,
        this.artId,
        'art_id'
      );
      if (returnData.modifiedCount === 0) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Update art error:', error);
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
      tag.art_ids = tag.art_ids.filter((art_id) => art_id !== this.artId);
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

  async addTagToArt(tagId: number): Promise<string> {
    let result = Const.SUCCESS;
    const art = this.art;
    if (!art) {
      console.error('Add tag error, could not find the art to update');
      return Const.FAILURE;
    }
    try {
      art.tag_ids = [...art.tag_ids, tagId];
      delete (art as any)._id;
      const returnData = await this.dataService.saveDocument(
        art,
        Collections.Art,
        this.artId,
        'art_id'
      );
      if (returnData.modifiedCount === 0) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Update art error:', error);
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
      tag.art_ids = [...tag.art_ids, this.artId];
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

  loadData(dataObservable: Observable<any>, action: any, refresh?: boolean) {
    dataObservable.pipe(take(1)).subscribe((data) => {
      if (refresh || !data || data.length === 0) {
        this.store.dispatch(() => action());
      }
    });
  }

  init(): void {
    this.loadData(this.art$, CoreDataActions.loadAllData);
  }

  setArtId() {
    this.artId = +(this.route.snapshot.paramMap.get('id') || 0);
  }

  constructor(
    private router: Router,
    private store: Store,
    private messagesService: MessagesService,
    private route: ActivatedRoute
  ) {
    super();
    this.setArtId();
    this.art$ = this.store.select(selectArt);
    this.artItem$ = this.store.select(selectArtById(this.artId));
    this.jobs$ = this.store.select(selectJobs);
    this.opStatus$ = this.store.select(selectOpStatus);
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
