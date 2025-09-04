import { Component } from '@angular/core';

import { Art } from '../../model/models';
import { ArtService } from '../../service/art-service';
import { SelectCard } from '../../components/select-card/select-card';

@Component({
  selector: 'app-art-page',
  imports: [SelectCard],
  templateUrl: './art-page.html',
  styleUrl: './art-page.scss',
  standalone: true,
})
export class ArtPage {
  artwork: Art[] = [];
  headerTitle = 'Art';
  addButtonText = 'Add selected to cart';

  constructor(private artService: ArtService) {
    this.artService.getArtData().subscribe((data) => {
      this.artwork = data;
    });
  }
}
