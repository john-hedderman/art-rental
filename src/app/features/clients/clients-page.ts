import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-clients-page',
  imports: [RouterOutlet],
  templateUrl: './clients-page.html',
  styleUrl: './clients-page.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    class: 'flex-grow-1',
  },
})
export class ClientsPage {}
