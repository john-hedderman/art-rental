import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Header } from './page/header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
})
export class App {}
