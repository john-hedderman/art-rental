import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-artists-ngrx-page',
  styleUrl: './artists-ngrx-page.scss',
  templateUrl: './artists-ngrx-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
export class ArtistsNgrxPage {}
