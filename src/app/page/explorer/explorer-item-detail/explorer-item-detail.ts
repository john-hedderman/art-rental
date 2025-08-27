import { Component } from '@angular/core';

@Component({
  selector: 'app-explorer-item-detail',
  imports: [],
  templateUrl: './explorer-item-detail.html',
  styleUrl: './explorer-item-detail.scss',
  standalone: true,
  host: {
    class: 'flex-grow-1',
  },
})
export class ExplorerItemDetail {
  detailHeading = 'Item';
}
