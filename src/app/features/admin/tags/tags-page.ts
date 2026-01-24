import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-tags-page',
  imports: [RouterOutlet],
  templateUrl: './tags-page.html',
  styleUrl: './tags-page.scss',
  standalone: true,
})
export class TagsPage {}
