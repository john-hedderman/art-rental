import { Component, Input } from '@angular/core';

import { ArtListItem } from './art-list-item/art-list-item';
import { Router } from '@angular/router';

@Component({
  selector: 'app-art-list',
  imports: [ArtListItem],
  templateUrl: './art-list.html',
  styleUrl: './art-list.scss',
  standalone: true,
})
export class ArtList {
  @Input() art: any;
  @Input() title: string | undefined;
  @Input() noTitle: string | undefined;

  constructor(private router: Router) {}

  navigateToArtDetails(id: string) {
    this.router.navigate(['art', id]);
  }
}
