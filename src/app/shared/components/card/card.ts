import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.html',
  styleUrl: './card.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
})
export class Card {
  cardData = input<any>({
    imageData: {
      source: '',
      alt: '',
      title: '',
    },
    title: '',
    text: '',
    footerText: '',
    clickHandler: null,
  });
}
