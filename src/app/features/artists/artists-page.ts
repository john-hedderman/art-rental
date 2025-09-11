import { Component } from '@angular/core';

import { PageHeader } from '../../shared/page-header/page-header';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-artists-page',
  imports: [PageHeader, RouterOutlet],
  templateUrl: './artists-page.html',
  styleUrl: './artists-page.scss',
  standalone: true,
})
export class ArtistsPage {}
