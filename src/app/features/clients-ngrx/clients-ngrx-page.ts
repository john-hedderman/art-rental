import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-clients-ngrx-page',
  styleUrl: './clients-ngrx-page.scss',
  templateUrl: './clients-ngrx-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
export class ClientsNgrxPage {}
