import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-art-list-item',
  imports: [],
  templateUrl: './art-list-item.html',
  styleUrl: './art-list-item.scss',
  standalone: true,
  host: {
    class: 'd-inline-block',
  },
})
export class ArtListItem {
  @Input() data: any;
}
