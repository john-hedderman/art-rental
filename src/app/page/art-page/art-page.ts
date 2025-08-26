import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ExplorerList } from '../explorer/explorer-list/explorer-list';

@Component({
  selector: 'app-art-page',
  imports: [ExplorerList, RouterOutlet],
  templateUrl: './art-page.html',
  styleUrl: './art-page.scss',
  standalone: true,
})
export class ArtPage {}
