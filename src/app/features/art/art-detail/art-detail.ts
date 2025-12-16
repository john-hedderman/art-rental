import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, map, Observable, of, take } from 'rxjs';
import { AsyncPipe } from '@angular/common';

import { Art, Artist, Client, Job, Site } from '../../../model/models';
import { PageHeader } from '../../../shared/components/page-header/page-header';
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

@Component({
  selector: 'app-art-detail',
  imports: [PageHeader, RouterLink, PageFooter, AsyncPipe],
  providers: [MessagesService],
  templateUrl: './art-detail.html',
  styleUrl: './art-detail.scss',
  standalone: true,
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

  artId = 0;

  deleteStatus = '';

  readonly OP_SUCCESS = Const.SUCCESS;
  readonly OP_FAILURE = Const.FAILURE;

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
    this.getCombinedData$().subscribe(({ artId, art, artists, clients, jobs, sites }) => {
      this.artId = artId;
      this.jobs = jobs;
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
  }> {
    return combineLatest({
      artId: this.getArtId(),
      art: this.dataService.art$,
      artists: this.dataService.artists$,
      clients: this.dataService.clients$,
      jobs: this.dataService.jobs$,
      sites: this.dataService.sites$,
    }).pipe(take(1));
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
  }
}
