import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { combineLatest, take } from 'rxjs';

import { Card } from '../../../shared/components/card/card';
import { Art, HeaderData } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { PageHeader } from '../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-art-list',
  imports: [Card, PageHeader, FormsModule],
  templateUrl: './art-list.html',
  styleUrl: './art-list.scss',
  standalone: true,
})
export class ArtList {
  artwork: Art[] = [];

  view = 'card';
  thumbnail_path = 'images/art/';

  goToArtDetail = (id: number) => {
    this.router.navigate(['/art', id]);
  };
  goToAddArt = () => {
    this.router.navigate(['/art', 'add']);
  };
  headerData: HeaderData = {
    headerTitle: 'Art',
    headerButtons: [
      {
        id: 'addArtBtn',
        label: 'Add Art',
        type: 'button',
        buttonClass: 'btn btn-primary btn-sm',
        disabled: false,
        clickHandler: this.goToAddArt,
      },
    ],
    headerLinks: [],
  };

  constructor(private dataService: DataService, private router: Router) {
    combineLatest({
      artwork: this.dataService.art$,
      jobs: this.dataService.jobs$,
      clients: this.dataService.clients$,
      artists: this.dataService.artists$,
    })
      .pipe(take(1))
      .subscribe(({ artwork, jobs, clients, artists }) => {
        this.artwork = artwork
          .map((art) => {
            let job = jobs.find((job) => job.job_id === art.job_id);
            if (job) {
              const client = clients.find((client) => client.client_id === job?.client_id);
              if (client) {
                job = { ...job, client };
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
