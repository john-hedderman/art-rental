import { Component, input, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-card',
  imports: [NgClass],
  templateUrl: './card.html',
  styleUrl: './card.scss',
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
    isSelectable: false,
    changeHandler: null,
  });
}
