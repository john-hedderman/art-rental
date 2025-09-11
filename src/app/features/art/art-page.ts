import { Component } from '@angular/core';

import { PageHeader } from '../../shared/page-header/page-header';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-art-page',
  imports: [PageHeader, RouterOutlet],
  templateUrl: './art-page.html',
  styleUrl: './art-page.scss',
  standalone: true,
})
export class ArtPage {}
