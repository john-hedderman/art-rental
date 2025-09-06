import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-client-detail',
  imports: [],
  templateUrl: './client-detail.html',
  styleUrl: './client-detail.scss',
  standalone: true,
})
export class ClientDetail implements OnInit {
  clientId: string | null = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.clientId = params.get('id');
    });
  }
}
