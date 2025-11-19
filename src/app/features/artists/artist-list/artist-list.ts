import { Component } from '@angular/core';
import { take } from 'rxjs';
import { Router } from '@angular/router';

import { Artist, ButtonbarData, HeaderData } from '../../../model/models';
import { Card } from '../../../shared/components/card/card';
import { DataService } from '../../../service/data-service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Buttonbar } from '../../../shared/components/buttonbar/buttonbar';
import { HeaderActions } from '../../../shared/actions/action-data';

@Component({
  selector: 'app-artist-list',
  imports: [Card, PageHeader, Buttonbar],
  templateUrl: './artist-list.html',
  styleUrl: './artist-list.scss',
  standalone: true,
  host: {
    class: 'overflow-y-auto',
  },
})
export class ArtistList {
  artists: Artist[] = [];

  goToArtistDetail = (id: number) => this.router.navigate(['/artists', id]);
  goToAddArtist = () => this.router.navigate(['/artists', 'add']);

  headerData = new HeaderActions('artist-list', 'Artists', [], []);

  buttonbarData: ButtonbarData = {
    buttons: [
      {
        id: 'addArtistBtn',
        label: 'Add artist',
        type: 'button',
        buttonClass: 'btn btn-primary',
        disabled: false,
        dataBsToggle: null,
        dataBsTarget: null,
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
