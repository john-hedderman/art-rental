import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-select-card',
  imports: [],
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
}
