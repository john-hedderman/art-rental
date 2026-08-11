import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-art-store-page',
  imports: [RouterOutlet],
  templateUrl: './art-store-page.html',
  styleUrl: './art-store-page.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
export class ArtStorePage {}
