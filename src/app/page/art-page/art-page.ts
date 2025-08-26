import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ExplorerList } from '../explorer/explorer-list/explorer-list';
import { ArtService } from '../../service/art-service';
import { Art } from '../../shared/models';

@Component({
  selector: 'app-art-page',
  imports: [ExplorerList, RouterOutlet],
  templateUrl: './art-page.html',
  styleUrl: './art-page.scss',
  standalone: true,
  host: {
    class: 'row g-0',
  },
})
export class ArtPage {
  listTitle = 'Art';
  noListTitle = 'No art available';
  data!: Art;

  constructor(private artService: ArtService) {
    this.artService.getArtData().subscribe((data) => {
      this.data = data;
    });
  }
}
