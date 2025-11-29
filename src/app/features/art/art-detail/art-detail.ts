import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, map, Observable, take } from 'rxjs';

import { Art } from '../../../model/models';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { DataService } from '../../../service/data-service';
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
import { DeleteButton } from '../../../shared/components/buttons/delete-button/delete-button';
import { MessagesService } from '../../../service/messages-service';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';

@Component({
  selector: 'app-art-detail',
  imports: [PageHeader, RouterLink, PageFooter],
  providers: [MessagesService],
  templateUrl: './art-detail.html',
  styleUrl: './art-detail.scss',
  standalone: true,
})
export class ArtDetail implements OnDestroy {
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
  artId = 0;

  deleteStatus = '';
  readonly OP_SUCCESS = Const.SUCCESS;
  readonly OP_FAILURE = Const.FAILURE;

  reloadFromDb(callback?: any) {
    this.dataService.load('art').subscribe((art) => {
      this.dataService.art$.next(art);
      if (callback) {
        callback();
      }
    });
  }

  async onClickDelete() {
    this.deleteStatus = await this.operationsService.deleteDocument(
      Collections.Art,
      'art_id',
      this.artId
    );
    this.messagesService.showStatus(this.deleteStatus, Msgs.DELETED_ART, Msgs.DELETE_ART_FAILED);
    this.messagesService.clearStatus();
    if (this.deleteStatus === Const.SUCCESS) {
      this.reloadFromDb(this.goToArtList);
    }
  }

  getArtId(): Observable<number> {
    return this.route.paramMap.pipe(map((params) => +params.get('id')!));
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService,
    private operationsService: OperationsService,
    private messagesService: MessagesService
  ) {
    combineLatest({
      artwork: this.dataService.art$,
      artId: this.getArtId(),
      jobs: this.dataService.jobs$,
      clients: this.dataService.clients$,
      artists: this.dataService.artists$,
      sites: this.dataService.sites$,
    })
      .pipe(take(1))
      .subscribe(({ artwork, artId, jobs, clients, artists, sites }) => {
        this.artId = artId;
        let art = artwork.find((piece) => piece.art_id === artId);
        if (art) {
          let job = jobs.find((job) => job.job_id === art?.job_id);
          if (job) {
            const client = clients.find((client) => client.client_id === job?.client_id);
            if (client) {
              job = { ...job, client };
            }
            const site = sites.find((site) => site.job_id === job?.job_id);
            if (site) {
              job = { ...job, site };
            }
            art = { ...art, job };
          }
          let artist = artists.find((artist) => artist.artist_id === art?.artist_id);
          if (artist) {
            art = { ...art, artist };
          }
        }
        this.art = art!;
      });
  }

  ngOnDestroy(): void {
    this.messagesService.clearStatus();
  }
}
