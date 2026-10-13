import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-sites-ngrx-page',
  styleUrl: './sites-ngrx-page.scss',
  templateUrl: './sites-ngrx-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
export class SitesNgrxPage {}
