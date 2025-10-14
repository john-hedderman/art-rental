import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { combineLatest, take } from 'rxjs';

import { Card } from '../../../shared/components/card/card';
import { Art, HeaderData } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Util } from '../../../shared/util/util';

@Component({
  selector: 'app-art-list',
  imports: [Card, PageHeader, FormsModule],
  templateUrl: './art-list.html',
  styleUrl: './art-list.scss',
  standalone: true,
})
export class ArtList {
  artwork: Art[] = [];

  selection = 'card';

  navigateToArtDetail = (id: number) => {
    this.router.navigate(['/art', id]);
  };
  navigateToAddToCart = () => {};
  navigateToAddArt = () => {};
  headerData: HeaderData = {
    headerTitle: 'Artwork',
    headerButtons: [
      {
        id: 'addArtBtn',
        label: 'Add Art',
        type: 'button',
        buttonClass: 'btn btn-primary btn-sm',
        disabled: false,
        clickHandler: this.navigateToAddArt,
      },
    ],
  };

  constructor(private dataService: DataService, private router: Router, public util: Util) {
    combineLatest({
      artwork: this.dataService.art$,
      jobs: this.dataService.jobs$,
      clients: this.dataService.clients$,
    })
      .pipe(take(1))
      .subscribe(({ artwork, jobs, clients }) => {
        this.artwork = artwork.map((art: Art) => {
          let job = jobs.find((job) => job.job_id === art.job?.job_id);
          if (job) {
            const client = clients.find((client) => client.client_id === job?.client?.client_id);
            if (client) {
              job = { ...job, client };
            }
            return { ...art, job };
          }
          return art;
        });
      });
  }
}
