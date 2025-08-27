import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ArtService } from '../../service/art-service';
import { Art } from '../../shared/models';
import { ArtList } from './art-list/art-list';

@Component({
  selector: 'app-art-page',
  imports: [ArtList, RouterOutlet],
  templateUrl: './art-page.html',
  styleUrl: './art-page.scss',
  standalone: true,
  host: {
    class: 'd-flex',
  },
})
export class ArtPage {
  listTitle = 'Art';
  noListTitle = 'No art available';
  art!: Art[];

  constructor(private artService: ArtService) {
    this.artService.getArtData().subscribe((data: Art[]) => {
      this.art = data;
    });
  }
}
