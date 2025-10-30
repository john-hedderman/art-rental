import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { combineLatest, take } from 'rxjs';

import { Card } from '../../../shared/components/card/card';
import { Art, ButtonbarData, HeaderData } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Buttonbar } from '../../../shared/components/buttonbar/buttonbar';

@Component({
  selector: 'app-art-list',
  imports: [Card, PageHeader, FormsModule, Buttonbar],
  templateUrl: './art-list.html',
  styleUrl: './art-list.scss',
  standalone: true,
})
export class ArtList {
  artwork: Art[] = [];

  thumbnail_path = 'images/art/';

  goToArtDetail = (id: number) => {
    this.router.navigate(['/art', id]);
  };
  goToAddArt = () => {
    this.router.navigate(['/art', 'add']);
  };
  headerData: HeaderData = {
    headerTitle: 'Art',
    headerButtons: [],
    headerLinks: [],
  };

  buttonbarData: ButtonbarData = {
    buttons: [
      {
        id: 'addArtBtn',
        label: 'Add art',
        type: 'button',
        buttonClass: 'btn btn-primary',
        disabled: false,
        dataBsToggle: null,
        dataBsTarget: null,
        clickHandler: this.goToAddArt,
      },
    ],
  };

  constructor(private dataService: DataService, private router: Router) {
    combineLatest({
      artwork: this.dataService.art$,
      jobs: this.dataService.jobs$,
      clients: this.dataService.clients$,
      artists: this.dataService.artists$,
      sites: this.dataService.sites$,
    })
      .pipe(take(1))
      .subscribe(({ artwork, jobs, clients, artists, sites }) => {
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
}
