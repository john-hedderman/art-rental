import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Navbar } from './shared/navbar/navbar';
import { PageHeader } from './shared/page-header/page-header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, PageHeader],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
})
export class App {
  title = 'Unforgettable Occasions';
}
