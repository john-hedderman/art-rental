import { Component } from '@angular/core';

import { Artist, HeaderButton, HeaderData } from '../../../model/models';
import { Card } from '../../../shared/components/card/card';
import { DataService } from '../../../service/data-service';
import { PageHeader2 } from '../../../shared/components/page-header-2/page-header-2';

@Component({
  selector: 'app-artist-list',
  imports: [Card, PageHeader2],
  templateUrl: './artist-list.html',
  styleUrl: './artist-list.scss',
  standalone: true,
  host: {
    class: 'overflow-y-auto',
  },
})
export class ArtistList {
  artists: Artist[] = [];

  headerData: HeaderData = {
    headerTitle: 'Artists',
    headerButtons: [],
  };

  constructor(private dataService: DataService) {
    this.dataService.artists$.subscribe((artists) => {
      if (artists) {
        this.artists = artists;
      }
    });
  }
}
