import { Component, OnInit } from '@angular/core';

import { ArtService } from '../../../service/art-service';
import { ExplorerListItem } from './explorer-list-item/explorer-list-item';

@Component({
  selector: 'app-explorer-list',
  imports: [ExplorerListItem],
  templateUrl: './explorer-list.html',
  styleUrl: './explorer-list.scss',
  standalone: true,
})
export class ExplorerList implements OnInit {
  artTitle = 'Art';
  noArt = 'No art available';
  artData$: any;

  constructor(private artService: ArtService) {}

  ngOnInit(): void {
    this.artService.getArtData().subscribe((data) => {
      this.artData$ = data;
    });
  }
}
