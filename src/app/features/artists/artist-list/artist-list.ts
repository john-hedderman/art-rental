import { Component } from '@angular/core';
import { take } from 'rxjs';

import { ArtistTest, HeaderData } from '../../../model/models';
import { Card } from '../../../shared/components/card/card';
import { DataService } from '../../../service/data-service';
import { PageHeader } from '../../../shared/components/page-header/page-header';

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
  artists: ArtistTest[] = [];

  navigateToArtistDetail = () => {};
  navigateToAddArtist = () => {};
  headerData: HeaderData = {
    headerTitle: 'Artists',
    headerButtons: [
      {
        id: 'addArtistBtn',
        label: 'Add Artist',
        type: 'button',
        buttonClass: 'btn btn-primary btn-sm',
        disabled: false,
        clickHandler: this.navigateToAddArtist,
      },
    ],
  };

  constructor(private dataService: DataService) {
    this.dataService.artists_test$.pipe(take(1)).subscribe((artists) => {
      if (artists) {
        this.artists = artists;
      }
    });
  }
}
