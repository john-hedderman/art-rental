import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-artist-card',
  imports: [],
  templateUrl: './artist-card.html',
  styleUrl: './artist-card.scss',
  standalone: true,
})
export class ArtistCard {
  @Input() artist: any;
}
