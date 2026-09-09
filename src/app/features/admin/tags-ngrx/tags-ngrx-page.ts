import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-tags-ngrx-page',
  styleUrl: './tags-ngrx-page.scss',
  templateUrl: './tags-ngrx-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
export class TagsNgrxPage {}
