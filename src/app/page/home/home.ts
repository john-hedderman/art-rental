import { Component } from '@angular/core';

import { ExplorerList } from '../explorer/explorer-list/explorer-list';
import { ExplorerItemDetail } from '../explorer/explorer-item-detail/explorer-item-detail';

@Component({
  selector: 'app-home',
  imports: [ExplorerList, ExplorerItemDetail],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  standalone: true,
})
export class Home {}
