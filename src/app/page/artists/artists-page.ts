import { Component } from '@angular/core';

import { ArtistService } from '../../service/artist-service';
import { Artist } from '../../model/models';
import { PageHeader } from '../../components/page-header/page-header';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-artists-page',
  imports: [PageHeader, RouterOutlet],
  templateUrl: './artists-page.html',
  styleUrl: './artists-page.scss',
  standalone: true,
})
export class ArtistsPage {
  artists: Artist[] = [];

  constructor(private artistService: ArtistService) {
    this.artistService.getArtistsData().subscribe((data) => {
      this.artists = data;
    });
  }
}
