import { Component } from '@angular/core';

import { ArtistCard } from './artist-card/artist-card';
import { ArtistService } from '../../service/artist-service';
import { Artist } from '../../shared/models';

@Component({
  selector: 'app-artists-page',
  imports: [ArtistCard],
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
