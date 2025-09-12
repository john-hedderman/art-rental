import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-artists-page',
  imports: [RouterOutlet],
  templateUrl: './artists-page.html',
  styleUrl: './artists-page.scss',
  standalone: true,
})
export class ArtistsPage {}
