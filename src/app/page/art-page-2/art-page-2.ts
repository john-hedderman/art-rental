import { Component } from '@angular/core';

import { Art } from '../../model/models';
import { ArtService } from '../../service/art-service';
import { Card } from '../../components/card/card';

@Component({
  selector: 'app-art-page-2',
  imports: [Card],
  templateUrl: './art-page-2.html',
  styleUrl: './art-page-2.scss',
  standalone: true,
})
export class ArtPage2 {
  artwork: Art[] = [];

  constructor(private artService: ArtService) {
    this.artService.getArtData().subscribe((data) => {
      this.artwork = data;
    });
  }
}
