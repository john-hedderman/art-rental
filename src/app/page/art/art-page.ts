import { Component } from '@angular/core';

import { Art } from '../../model/models';
import { ArtService } from '../../service/art-service';
import { PageHeader } from '../../components/page-header/page-header';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-art-page',
  imports: [PageHeader, RouterOutlet],
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
