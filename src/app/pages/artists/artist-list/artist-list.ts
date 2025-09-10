import { Component, OnInit } from '@angular/core';

import { Artist, HeaderButton } from '../../../model/models';
import { PageHeaderService } from '../../../service/page-header-service';
import { ArtistService } from '../../../service/artist-service';
import { Card } from '../../../components/card/card';

@Component({
  selector: 'app-artist-list',
  imports: [Card],
  templateUrl: './artist-list.html',
  styleUrl: './artist-list.scss',
  standalone: true,
  host: {
    class: 'overflow-y-auto',
  },
})
export class ArtistList implements OnInit {
  artists: Artist[] = [];

  headerTitle = 'Artists';

  headerButtons: HeaderButton[] = [];

  constructor(private pageHeaderService: PageHeaderService, private artistService: ArtistService) {
    this.artistService.getArtistsData().subscribe((data) => {
      this.artists = data;
    });
  }

  ngOnInit(): void {
    this.pageHeaderService.sendData({
      headerTitle: this.headerTitle,
      headerButtons: this.headerButtons,
    });
  }
}
