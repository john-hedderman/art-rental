import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-art-card',
  imports: [],
  templateUrl: './art-card.html',
  styleUrl: './art-card.scss',
  standalone: true,
})
export class ArtCard {
  @Input() art: any;
}
