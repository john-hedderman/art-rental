import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-art-page',
  imports: [RouterOutlet],
  templateUrl: './art-page.html',
  styleUrl: './art-page.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
})
export class ArtPage {}
