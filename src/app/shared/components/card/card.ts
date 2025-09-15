import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-card',
  imports: [NgClass],
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
  @Input() isSelectable = false;
  @Input() changeHandler: any;
}
