import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-select-card',
  imports: [NgClass],
  templateUrl: './select-card.html',
  styleUrl: './select-card.scss',
  standalone: true,
})
export class SelectCard {
  @Input() imageSource = '';
  @Input() imageAlt = '';
  @Input() imageTitle = '';
  @Input() cardTitle = '';
  @Input() cardText = '';
  @Input() isSelectable = false;
}
