import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-jobs',
  imports: [RouterOutlet],
  templateUrl: './jobs-page.html',
  styleUrl: './jobs-page.scss',
  standalone: true,
})
export class JobsPage {}
