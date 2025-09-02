import { Component } from '@angular/core';

import { Art } from '../../model/models';
import { ArtService } from '../../service/art-service';
import { Card } from '../../components/card/card';

@Component({
  selector: 'app-art-page',
  imports: [Card],
  templateUrl: './art-page.html',
  styleUrl: './art-page.scss',
  standalone: true,
})
export class ArtPage {
  artwork: Art[] = [];

  constructor(private artService: ArtService) {
    this.artService.getArtData().subscribe((data) => {
      this.artwork = data;
    });
  }
}
