import { Component, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { Card } from '../../../shared/components/card/card';
import { IArt, IArtist, IClient, IJob, ISite } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ActionButton, FooterActions, HeaderActions } from '../../../shared/actions/action-data';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { AddButton } from '../../../shared/buttons/add-button';
import { DataCacheService } from '../../../service/data-cache-service';

type CacheItem = {
  [key: string]: any[];
};

@Component({
  selector: 'app-art2-list',
  imports: [Card, PageHeader, FormsModule, PageFooter],
  templateUrl: './art2-list.html',
  styleUrl: './art2-list.scss',
  standalone: true
})
export class Art2List implements OnInit, OnDestroy {
  dataCacheService = inject(DataCacheService);

  goToArtDetail = (id: number) => this.router.navigate(['/art', id]);
  goToAddArt = () => this.router.navigate(['/art', 'add']);

  updateVortex = () => {
    // updateCache works with service's _cacheData and cacheData()
    this.dataCacheService.updateCache([
      {
        type: 'art',
        data: [
          {
            art_id: 1760634577894,
            title: 'Ethereal Vortex Imagination!',
            file_name: 'pastel.jpg',
            full_size_image_url: 'images/art/full/pastel.jpg',
            artist_id: 1760624322012,
            job_id: 1760896015212,
            tag_ids: [1, 5]
          }
        ]
      }
    ]);
  };

  updateMovement = () => {
    this.dataCacheService.updateCache([
      {
        type: 'art',
        data: [
          {
            art_id: 1760634717603,
            title: 'Meta Fifth Movement!',
            file_name: 'geometry.jpg',
            full_size_image_url: 'images/art/full/geometry.jpg',
            artist_id: 1760626204589,
            job_id: 1760896133919,
            tag_ids: [1, 2]
          }
        ]
      }
    ]);
  };

  updateVortexBtn = new ActionButton(
    'updateVortextBtn',
    'Update Ethereal Vortex Imagined',
    'button',
    'btn btn-primary ms-3',
    false,
    null,
    null,
    this.updateVortex
  );

  updateMovementBtn = new ActionButton(
    'updateMovementBtn',
    'Update Meta Movement',
    'button',
    'btn btn-primary ms-3',
    false,
    null,
    null,
    this.updateMovement
  );

  headerData = new HeaderActions('art-list', 'Art', [], []);
  footerData = new FooterActions([
    new AddButton('Add Art', this.goToAddArt),
    this.updateVortexBtn,
    this.updateMovementBtn
  ]);

  artwork: IArt[] = [];

  thumbnail_path = 'images/art/';

  private readonly destroy$ = new Subject<void>();

  data: { [key: string]: any } = {
    art: [],
    artists: [],
    clients: [],
    contacts: [],
    jobs: [],
    sites: []
  };

  // argument data is the cache data
  enhanceArtData(data: any) {
    if (data) {
      const entries = Object.entries(data);
      for (let collectionData of entries) {
        const [dataType, dataData] = collectionData;
        this.data[dataType] = dataData;
      }
      // add artist, job, client, and site information to "art"
      this.data['art'] = this.data['art']
        // this.data['art'] = this.data['art']
        .map((art: IArt) => {
          const artist = this.data['artists'].find(
            (artist: IArtist) => artist.artist_id === art.artist_id
          );
          if (artist) {
            return { ...art, artist };
          }
          return art;
        })
        .map((art: IArt) => {
          let job = this.data['jobs'].find((job: IJob) => job.job_id === art.job_id);
          if (job) {
            const client = this.data['clients'].find(
              (client: IClient) => client.client_id === job.client_id
            );
            if (client) {
              job = { ...job, client };
            }
            const site = this.data['sites'].find((site: ISite) => site.site_id === job.site_id);
            if (site) {
              job = { ...job, site };
            }
            return { ...art, job };
          }
          return art;
        });
    }
  }

  loadData(collections: any = []) {
    this.dataCacheService.loadData(collections);
  }

  constructor(
    private dataService: DataService,
    private router: Router
  ) {
    effect(() => {
      const cacheData = this.dataCacheService.cacheData();
      this.enhanceArtData(cacheData); // add related art data whenever the cache is updated
    });
  }

  ngOnInit(): void {
    this.loadData(['art', 'artists', 'jobs', 'clients', 'sites']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
