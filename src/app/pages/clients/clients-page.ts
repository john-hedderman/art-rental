import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PageHeader } from '../../components/page-header/page-header';

@Component({
  selector: 'app-clients-page',
  imports: [PageHeader, RouterOutlet],
  templateUrl: './clients-page.html',
  styleUrl: './clients-page.scss',
  standalone: true,
})
export class ClientsPage {}
