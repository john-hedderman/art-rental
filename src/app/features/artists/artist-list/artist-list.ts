import { Component } from '@angular/core';
import { take } from 'rxjs';

import { Artist, HeaderData } from '../../../model/models';
import { Card } from '../../../shared/components/card/card';
import { DataService } from '../../../service/data-service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Router } from '@angular/router';

@Component({
  selector: 'app-artist-list',
  imports: [Card, PageHeader],
  templateUrl: './artist-list.html',
  styleUrl: './artist-list.scss',
  standalone: true,
  host: {
    class: 'overflow-y-auto',
  },
})
export class ArtistList {
  artists: Artist[] = [];

  goToArtistDetail = () => {};
  goToAddArtist = () => {
    this.router.navigate(['/artists', 'add']);
  };
  headerData: HeaderData = {
    headerTitle: 'Artists',
    headerButtons: [
      {
        id: 'addArtistBtn',
        label: 'Add Artist',
        type: 'button',
        buttonClass: 'btn btn-primary btn-sm',
        disabled: false,
        clickHandler: this.goToAddArtist,
      },
    ],
  };

  constructor(private dataService: DataService, private router: Router) {
    this.dataService.artists$.pipe(take(1)).subscribe((artists) => {
      if (artists) {
        this.artists = artists;
      }
    });
  }
}
