import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-sites-page',
  imports: [RouterOutlet],
  templateUrl: './sites-page.html',
  styleUrl: './sites-page.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
})
export class SitesPage {}
