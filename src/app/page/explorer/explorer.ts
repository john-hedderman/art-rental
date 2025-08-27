import { Component } from '@angular/core';
import { ExplorerList } from './explorer-list/explorer-list';
import { ExplorerItemDetail } from './explorer-item-detail/explorer-item-detail';

@Component({
  selector: 'app-explorer',
  imports: [ExplorerList, ExplorerItemDetail],
  templateUrl: './explorer.html',
  styleUrl: './explorer.scss',
  standalone: true,
  host: {
    class: 'd-flex flex-grow-1',
  },
})
export class Explorer {}
