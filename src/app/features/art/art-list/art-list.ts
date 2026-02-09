import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { combineLatest, distinctUntilChanged, Observable, Subject, takeUntil } from 'rxjs';

import { Card } from '../../../shared/components/card/card';
import { Art, IArtist, Client, Job, Site } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ActionButton, FooterActions, HeaderActions } from '../../../shared/actions/action-data';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { AddButton } from '../../../shared/buttons/add-button';

@Component({
  selector: 'app-art-list',
  imports: [Card, PageHeader, FormsModule, PageFooter],
  templateUrl: './art-list.html',
  styleUrl: './art-list.scss',
  standalone: true
})
export class ArtList implements OnInit, OnDestroy {
  goToArtDetail = (id: number) => this.router.navigate(['/art', id]);
  goToAddArt = () => this.router.navigate(['/art', 'add']);

  headerData = new HeaderActions('art-list', 'Art', [], []);
  footerData = new FooterActions([new AddButton('Add Art', this.goToAddArt)]);

  artwork: Art[] = [];

  thumbnail_path = 'images/art/';

  private readonly destroy$ = new Subject<void>();

  init(): void {
    this.getCombinedData$().subscribe(({ artwork, jobs, clients, artists, sites }) => {
      this.artwork = artwork
        .map((art) => {
          let job = jobs.find((job) => job.job_id === art.job_id);
          if (job) {
            const client = clients.find((client) => client.client_id === job?.client_id);
            if (client) {
              job = { ...job, client };
            }
            const site = sites.find((site) => site.site_id === job?.site_id);
            if (site) {
              job = { ...job, site };
            }
            return { ...art, job };
          }
          return art;
        })
        .map((art) => {
          const artist = artists.find((artist) => artist.artist_id === art.artist_id);
          if (artist) {
            return { ...art, artist };
          }
          return art;
        });
    });
  }

  getCombinedData$(): Observable<{
    artwork: Art[];
    artists: IArtist[];
    clients: Client[];
    jobs: Job[];
    sites: Site[];
  }> {
    return combineLatest({
      artwork: this.dataService.art$,
      artists: this.dataService.artists$,
      clients: this.dataService.clients$,
      jobs: this.dataService.jobs$,
      sites: this.dataService.sites$
    }).pipe(takeUntil(this.destroy$), distinctUntilChanged());
  }

  constructor(
    private dataService: DataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
