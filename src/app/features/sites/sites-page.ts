import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-sites-page',
  imports: [RouterOutlet],
  templateUrl: './sites-page.html',
  styleUrl: './sites-page.scss',
  standalone: true,
})
export class SitesPage {}
