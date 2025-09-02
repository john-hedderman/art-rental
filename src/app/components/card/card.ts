import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.html',
  styleUrl: './card.scss',
  standalone: true,
})
export class Card {
  @Input() imageSource = '';
  @Input() imageAlt = '';
  @Input() imageTitle = '';
  @Input() cardTitle = '';
  @Input() cardText = '';
}
