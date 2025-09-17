import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-clients-page',
  imports: [RouterOutlet],
  templateUrl: './clients-page.html',
  styleUrl: './clients-page.scss',
  standalone: true,
  host: {
    class: 'flex-grow-1',
  },
})
export class ClientsPage {}
