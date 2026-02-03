import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, distinctUntilChanged, map, Observable, of, Subject, takeUntil } from 'rxjs';
import { AsyncPipe } from '@angular/common';

import { Art, Artist, Client, Job, Site, Tag } from '../../../model/models';
import { PageHeader } from '../../../shared/components/page-header/page-header';
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
  selector: 'app-art-detail',
  imports: [PageHeader, RouterLink, PageFooter, AsyncPipe, Tags],
  providers: [MessagesService],
  templateUrl: './art-detail.html',
  styleUrl: './art-detail.scss',
  standalone: true
})
export class ArtDetail extends DetailBase implements OnInit, OnDestroy {
  goToEditArt = () => this.router.navigate(['/art', this.artId, 'edit']);
  goToArtList = () => this.router.navigate(['/art', 'list']);

  artListLink = new ActionLink('artListLink', 'Art', '/art/list', '', this.goToArtList);
  headerData = new HeaderActions('art-detail', 'Art detail', [], [this.artListLink.data]);

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

  art: Art = {} as Art;
  art$: Observable<Art> | undefined;
  jobs: Job[] = [];
  tags: Tag[] = [];

  artId = 0;

  deleteStatus = '';

  addTagToArtStatus = '';
  updateAddedTagStatus = '';

  removeTagFromArtStatus = '';
  updateRemovedTagStatus = '';

  readonly OP_SUCCESS = Const.SUCCESS;
  readonly OP_FAILURE = Const.FAILURE;
  WAREHOUSE_JOB_NUMBER = Const.WAREHOUSE_JOB_NUMBER;
  NO_SITE = Const.NO_SITE;

  private readonly destroy$ = new Subject<void>();

  override preDelete(): void {}

  override async delete(): Promise<string> {
    const deleteStatus = await this.deleteArt();
    const jobStatus = await this.updateJob();
    return this.jobResult([deleteStatus, jobStatus]);
  }

  override postDelete(): void {
    this.messagesService.showStatus(
      this.deleteStatus,
      Util.replaceTokens(Msgs.DELETED, { entity: 'art' }),
      Util.replaceTokens(Msgs.DELETE_FAILED, { entity: 'art' })
    );
    this.messagesService.clearStatus();
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

  async onClickDelete() {
    this.deleteAndReload(['art', 'jobs'], this.goToArtList);
  }

  async deleteArt(): Promise<string> {
    return await this.operationsService.deleteDocument(Collections.Art, 'art_id', this.artId);
  }

  async updateJob(): Promise<string> {
    if (this.art.job_id === Const.NO_JOB) {
      return Const.SUCCESS;
    }
    const job = this.jobs.find((job) => job.job_id === this.art.job_id);
    if (!job) {
      console.error('Delete art error, could not find the job');
      return Const.FAILURE;
    }
    const collection = Collections.Jobs;
    let result = Const.SUCCESS;
    try {
      job.art_ids = job.art_ids.filter((art_id) => art_id !== this.artId);
      delete (job as any)._id;
      const returnData = await this.dataService.saveDocument(job, collection, job.job_id, 'job_id');
      if (returnData.modifiedCount === 0) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Save art error:', error);
      result = Const.FAILURE;
    }
    return result;
  }

  getArtId(): Observable<number> {
    return this.route.paramMap.pipe(map((params) => +params.get('id')!));
  }

  init(): void {
    this.getCombinedData$().subscribe(({ artId, art, artists, clients, jobs, sites, tags }) => {
      this.artId = artId;
      this.jobs = jobs;
      this.tags = tags;
      let artwork = art.find((piece: Art) => piece.art_id === artId);
      if (artwork) {
        let job = jobs.find((job) => job.job_id === artwork?.job_id);
        if (job) {
          const client = clients.find((client) => client.client_id === job?.client_id);
          if (client) {
            job = { ...job, client };
          }
          const site = sites.find((site) => site.site_id === job?.site_id);
          if (site) {
            job = { ...job, site };
          }
          artwork = { ...artwork, job };
        }
        let artist = artists.find((artist) => artist.artist_id === artwork?.artist_id);
        if (artist) {
          artwork = { ...artwork, artist };
        }
        this.art = artwork;
        this.art$ = of(this.art);
      }
    });
  }

  getCombinedData$(): Observable<{
    artId: number;
    art: Art[];
    artists: Artist[];
    clients: Client[];
    jobs: Job[];
    sites: Site[];
    tags: Tag[];
  }> {
    return combineLatest({
      artId: this.getArtId(),
      art: this.dataService.art$,
      artists: this.dataService.artists$,
      clients: this.dataService.clients$,
      jobs: this.dataService.jobs$,
      sites: this.dataService.sites$,
      tags: this.dataService.tags$
    }).pipe(takeUntil(this.destroy$), distinctUntilChanged());
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
