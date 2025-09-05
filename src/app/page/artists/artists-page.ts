import { Component } from '@angular/core';

import { ArtistService } from '../../service/artist-service';
import { Artist } from '../../model/models';
import { Card } from '../../components/card/card';

@Component({
  selector: 'app-artists-page',
  imports: [Card],
  templateUrl: './artists-page.html',
  styleUrl: './artists-page.scss',
  standalone: true,
})
export class ArtistsPage {
  artists: Artist[] = [];
  headerTitle = 'Artists';
  primaryWork = 'Primary work: ';

  constructor(private artistService: ArtistService) {
    this.artistService.getArtistsData().subscribe((data) => {
      this.artists = data;
    });
  }
}
